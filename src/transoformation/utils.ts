import { camelCase, chain, get, map, mapKeys, mapValues, omitBy, isNil, isFinite, isEmpty, isString, toNumber } from 'lodash';

export class Util {
  public static sanitiseString(str: string | number): string | number | undefined {
    let result = str;
    if (isFinite(str) && !isEmpty(str)) {
      return toNumber(str);
    }

    if (!isFinite(str) && isEmpty(str)) {
      return undefined;
    }

    if (isString(str) && !isEmpty(str)) {
      result = chain(str).replace('\r', ' ').replace(/\s+/, ' ').trim().value();
    }

    return result;
  }

  public static renameKeys(data: any[], newKeys: Record<string, unknown>): any[] {
    if (isNil(newKeys) || isEmpty(newKeys)) {
      return data;
    }
    return map(data, (i) => mapKeys(i, (_, key) => get(newKeys, key, key)));
  }

  public static mapDataKeys = (data: any[]): any[] =>
    chain(data)
      .map((i) => mapKeys(i, (_x: any, key: string): string => camelCase(key)))
      .value();

  public static mapDataValues = (data: any[]): any[] =>
    chain(data)
      .map((i) => mapValues(i, Util.sanitiseString))
      .value();

  public static cleanupData = (data: any): any =>
    chain(data)
      .map((i) => omitBy(i, isNil))
      .value();
}
