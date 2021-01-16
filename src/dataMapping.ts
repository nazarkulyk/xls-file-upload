import { get, isEmpty, map, mapKeys, flatten, filter, compact, reject, values, every, isNil } from 'lodash';
import { Mappings, Translation, Aggregation, Decomposition, Util, Calculate, Move } from './transoformation';
import type { ConfigDataMapping } from './config/defaultDataMapping';

export interface FileOptions {
  srcFile: string;
  output?: string;
}

export class DataMapping {
  public static async parseSubEntity(sheet: any, transformationPart: ConfigDataMapping): Promise<any> {
    if (isNil(transformationPart)) {
      throw new Error('transformationPart is missing');
    }
    try {
      const data = reject(compact(sheet), (entry) => every(values(entry), isEmpty));
      // console.debug(data);
      const filteredData = transformationPart.filter ? filter(data, transformationPart.filter) : data;
      const keyMapData = Util.renameKeys(filteredData, transformationPart.renameKeys);
      let mapData = Util.cleanupData(Util.mapDataValues(Util.mapDataKeys(keyMapData)));
      mapData = !transformationPart.notRemoveUndescoreNumber
        ? map(mapData, (i: any): any => mapKeys(i, (_, key: string): string => key.replace(/_\d+/, '')))
        : mapData;

      // console.debug(mapData);

      const translated = transformationPart.translation ? Translation.parse(mapData, transformationPart.translation) : mapData;
      const customeMaped = transformationPart.mappings ? Mappings.parse(translated, transformationPart.mappings) : translated;

      const cusomeAggregated = transformationPart.aggregation
        ? Aggregation.parse(customeMaped, transformationPart.aggregation)
        : customeMaped;
      const cusomeDecomposited = transformationPart.decomposition
        ? Decomposition.parse(cusomeAggregated, transformationPart.decomposition)
        : cusomeAggregated;
      const merged = transformationPart.mergeWith
        ? map(cusomeDecomposited, (i) => ({ ...i, ...transformationPart.mergeWith }))
        : cusomeDecomposited;
      const calculated = transformationPart.calculate ? Calculate.parse(merged, transformationPart.calculate) : merged;
      const moved = transformationPart.move ? Move.parse(calculated, transformationPart.move) : calculated;
      return moved;
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  public static async run(type: string, Config: any, data: any): Promise<unknown[]> {
    const EntityData = get(Config, type);
    try {
      const task = await DataMapping.parseSubEntity(data, EntityData);
      const resultTask = flatten(task);
      return resultTask;
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
