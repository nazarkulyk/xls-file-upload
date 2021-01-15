import { get, chain, eq, map, mapValues, merge, keys, lowerCase, pick, isNil, split, trim, update, toNumber, isFunction } from 'lodash';
import { divide } from 'number-precision';

const TRANS_PROPERTY = 'translations';
const TRANS_VALUE_PROPERTY = 'translation';

export class Mappings {
  public static parse(entries: any[], options: Record<string, unknown>): any[] {
    return map(entries, (entry) => {
      const newEntrie = pick(entry, keys(options));
      return merge(
        entry,
        mapValues(newEntrie, (value, key) => {
          if (isNil(value)) {
            return value;
          }
          const fn = get(options, key);
          if (isFunction(fn)) {
            return fn(value);
          }
          return (get(Mappings, fn as string) as (value: unknown) => unknown[])(value);
        })
      );
    });
  }

  public static mapSelectionComponent(component: string): any {
    // eslint-disable-next-line no-useless-escape
    const result = /^(\s*(?<amount>[0-9,\.]+)\s+KG)?\s*(?<name>[^@]*)\s*(@(?<magicNumber>\d+)@)?$/.exec(component);
    if (!result || !result.groups) {
      return null;
    }
    const comps = chain({ ...result.groups })
      .update('amount', Mappings.makeNumber)
      .update('name', trim)
      .omitBy(isNil)
      .value();
    return comps;
  }

  public static mapLoEnergySelectionComponent(components: string): any {
    return map(split(components, '\n'), (component) => {
      // eslint-disable-next-line no-useless-escape
      const result = /^(?<materialNumber>\d+)?(\s*(?<amount>[0-9,\.]+)\s+KG)?\s*(?<name>[^@]*)\s*(@(?<magicNumber>\d+)@)?$/.exec(
        trim(component)
      );
      if (!result || !result.groups) {
        return null;
      }
      const comps = chain({ ...result.groups })
        .update('amount', Mappings.makeNumber)
        .update('name', trim)
        .omitBy(isNil)
        .value();
      return comps;
    });
  }

  public static mapLoSelectionComponent(components: string): any {
    return map(split(components, '\n'), (component) => {
      // eslint-disable-next-line no-useless-escape
      const result = /^(\s*(?<amount>[0-9,\.]+)\s+KG)?\s*(?<name>[^@^\d]*)\s*(@?(?<magicNumber>\d+)@?)?$/.exec(trim(component));
      if (!result || !result.groups) {
        return null;
      }
      const comps = chain({ ...result.groups })
        .update('amount', Mappings.makeNumber)
        .update('name', trim)
        .omitBy(isNil)
        .value();
      return comps;
    });
  }

  public static mapComponent(component: string): any {
    // eslint-disable-next-line no-useless-escape
    const result = /^(?<materialNumber>\d+)?(\s*(?<amount>[0-9,\.]+)\s+KG)?\s*(?<name>[^@]*)\s*(@(?<magicNumber>\d+)@)?$/.exec(
      trim(component)
    );
    if (!result || !result.groups) {
      return null;
    }
    const comps = chain({ ...result.groups })
      .update('amount', Mappings.makeNumber)
      .update('name', trim)
      .omitBy(isNil)
      .value();
    return comps;
  }

  public static makeNumberArray(data: string): number[] {
    return chain(data).replace(' ', ',').trim().split(',').map(toNumber).value();
  }

  public static makeStringArray(data: string): string[] {
    return chain(data).replace(' ', ',').trim().split(',').value();
  }

  public static jaToTrue(data: string): boolean {
    return eq(lowerCase(data), 'ja');
  }

  public static makeNumberDivT(data: string): number {
    return divide(Mappings.makeNumber(data), 1000);
  }

  public static makeNumber(data: string): number {
    return chain(data).replace(',', '.').trim().toNumber().value();
  }

  public static makeString(data: string): string {
    return chain(data).replace(',', '.').trim().value();
  }

  public static removeStringNull(data: string): string {
    const str = chain(data).trim().value();
    return chain(str).toUpper().eq('NULL').value() ? null : str;
  }

  public static removePercent(data: string): number {
    return chain(data).replace('%', '').replace(',', '.').trim().toNumber().value();
  }

  public static removeKg(data: string): number {
    return chain(data).replace('kg', '').replace(',', '.').trim().toNumber().value();
  }

  public static removeMPercent(data: string): number {
    return chain(data).replace('M%', '').replace(',', '.').trim().toNumber().value();
  }

  public static camelCase(data: string): string {
    return chain(data).camelCase().trim().value();
  }

  public static lowerCase(data: string): string {
    return chain(data).lowerCase().trim().value();
  }

  public static upperCase(data: string): string {
    return chain(data).upperCase().trim().value();
  }

  public static replaceMinus(data: string): string {
    return chain(data).replace('--', ',').replace(' -', ',').replace('- ', ',').value();
  }

  public static mapTranslation(data: Record<string, unknown>): any {
    return update(data, TRANS_VALUE_PROPERTY, Mappings.replaceMinus);
  }

  public static replaceMinusTranslated<T>(data: T): T {
    return chain(data)
      .update(TRANS_PROPERTY, (i) => map(i, Mappings.mapTranslation))
      .value();
  }
}
