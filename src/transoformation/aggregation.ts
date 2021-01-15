import { get, head, filter, map, keys, each, merge, pick, omit, set, startsWith, values, replace, mapKeys, camelCase } from 'lodash';

export class Aggregation {
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static parse(entries: any[], options: object): any[] {
    return map(entries, (entry) => {
      let newEntry = {};
      each(keys(options), (key) => {
        const opt = get(options, key);
        const fns = keys(opt);
        const fn = head(fns);
        const transformed = get(Aggregation, fn)(entry, key, get(opt, fn));
        newEntry = merge(newEntry, transformed);
      });
      const result = newEntry;
      return result;
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static byStartingString<T extends object>(entry: T, key: string, opts: string): Partial<T> {
    const attrs: string[] = filter(keys(entry), (k) => startsWith(k, opts));
    return Aggregation.pickObjectData(entry, key, attrs, opts);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static byKeyNumbering<T extends object>(entry: T, key: string, opts: string): Partial<T> {
    const attrs: string[] = filter(keys(entry), (k) => startsWith(k, opts));
    return Aggregation.pickData(entry, key, attrs);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static pickData<T extends object>(entry: T, key: string, attrs: string[]): Partial<T> {
    const setValues = values(pick(entry, attrs));

    return { ...omit(entry, attrs), [key]: setValues };
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static pickObjectData<T extends object>(entry: T, key: string, attrs: string[], startKey: string): Partial<T> {
    const setValues = pick(entry, attrs);

    const mapKey = (keyToMap: string): string => camelCase(keyToMap === startKey ? startKey : replace(keyToMap, startKey, ''));

    return { ...omit(entry, attrs), [key]: mapKeys(setValues, (_, valueKey) => mapKey(valueKey)) };
  }
}
