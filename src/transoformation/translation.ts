import {
  get,
  groupBy,
  filter,
  map,
  merge,
  endsWith,
  keys,
  toLower,
  flatten,
  omit,
  spread,
  pick,
  reduce,
  size,
  set,
  startsWith,
  transform,
  toArray,
  union
} from 'lodash';
// static mappings

const TRANS_PROPERTY = '.translations';
const TRANS_LANG_PROPERTY = 'language';
const TRANS_VALUE_PROPERTY = 'translation';

const mergeByArray = spread(merge);

export class Translation {
  public static parse(entries: any[], options: any): any[] {
    const translateFns = keys(options);
    return map(entries, (entry) => {
      let columnListToOmit: any[] = [];

      const list = mergeByArray(
        map(translateFns, (fn) => {
          const { languages, prefix } = get(options, fn);
          const transOptions = Translation.checkColumnNames(languages, entry, prefix);
          const colmnList = map(flatten(toArray(transOptions)), 'path');
          const newEntry = pick(entry, colmnList);
          columnListToOmit = union(columnListToOmit, colmnList);
          return get(Translation, fn)(newEntry, transOptions);
        })
      );

      return merge(omit(entry, columnListToOmit), list);
    });
  }

  public static dosage(data: any[], options: any) {
    const trFn = (result: any, value: any) => {
      set(result, value.lang, get(data, value.path));
      return result;
    };

    const r = reduce(
      options,
      (result, value, key) => {
        set(result, key, transform(value, trFn, {}));
        return result;
      },
      {}
    );

    return r;
  }

  public static dosage1(data: any[], options: any) {
    return Translation.dosage(data, options);
  }

  public static dosage2(data: any[], options: any) {
    return Translation.dosage(data, options);
  }

  public static dosage3(data: any[], options: any) {
    return Translation.dosage(data, options);
  }

  public static translate(data: any[], options: any) {
    // console.log('translate', data, options);

    const trFn = (result: any, value: any) => {
      const r = {};
      set(r, TRANS_LANG_PROPERTY, value.lang);
      set(r, TRANS_VALUE_PROPERTY, get(data, value.path));
      result.push(r);
      return result;
    };

    const r = reduce(
      options,
      (result, value, key) => {
        set(result, key + TRANS_PROPERTY, transform(value, trFn, []));
        return result;
      },
      {}
    );

    return r;
  }

  private static getLangColumnNames(lang: string, data: any, prefix?: string): any {
    const fn = (k: string, l: string) => {
      return prefix ? startsWith(toLower(k), prefix) && endsWith(toLower(k), l) : endsWith(toLower(k), l);
    };

    return map(
      filter(keys(data), (key) => fn(key, lang)),
      (col) => ({ col: col.slice(0, 0 - size(lang)), lang, path: col })
    );
  }

  private static checkColumnNames(langs: string[], data: any, prefix?: string) {
    const cols = map(langs, (lang) => Translation.getLangColumnNames(lang, data, prefix));
    return groupBy(flatten(cols), 'col');
  }
}
