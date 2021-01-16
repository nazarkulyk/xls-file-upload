import {
  get,
  flatten,
  cloneDeep,
  map,
  merge,
  keys,
  omit,
  pick,
  set,
  split,
  trim,
  transform,
  spread,
  update,
  unzip,
  zip,
  head,
  words,
  tail,
  join
} from 'lodash';
import { Mappings } from './mappings';

const TRANS_PROPERTY = '.translations';
const TRANS_LANG_PROPERTY = 'language';
const TRANS_VALUE_PROPERTY = 'translation';

const mergeByArray = spread(merge);

export class Decomposition {
  public static parse<T>(entries: T[], options: any): T[] {
    // console.log("decomposition", options);
    const columns = keys(options);

    // console.log('decomposition', options, entries);

    return map(entries, (entry) => {
      const list = spread(merge)(
        map(columns, (column) => {
          const fn = get(options, column);
          // console.log('decomposition', entry, column);
          return get(Decomposition, fn)(pick(entry, column), column);
        })
      );

      return merge(entry, list);
    });
  }

  public static splitByComa(data: string): string[] {
    return map(split(data, ','), trim);
  }

  public static splitName(data: string, key: string): Record<string, any> {
    const value = map(words(get(data, `${key}.name`)), trim);
    return {
      [key]: {
        firstName: head(value),
        lastName: join(tail(value), ' ')
      }
    };
  }

  public static default<T extends Record<string, unknown>>(obj: T, key: string): T {
    return update(obj, key, Decomposition.splitByComa);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static translatedBaseSplit<T extends object>(obj: T, key: string): any[] {
    const translations = get(obj, key + TRANS_PROPERTY);
    let result = map(translations, (t) => update(t, TRANS_VALUE_PROPERTY, Decomposition.splitByComa));
    result = map(result, (langEntry) => {
      const language = get(langEntry, TRANS_LANG_PROPERTY);
      return map(get(langEntry, TRANS_VALUE_PROPERTY), (translation) => ({
        language,
        translation
      }));
    });
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static translatedSplit<T extends object>(obj: T, key: string): T {
    const result = Decomposition.translatedBaseSplit(obj, key);

    set(obj, key + TRANS_PROPERTY, flatten(result));
    return obj;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static translatedSplitDependent<T extends object>(obj: T, key: string): T {
    let result = Decomposition.translatedBaseSplit(obj, key);

    result = map(unzip(result), (item) => ({
      translations: item
    }));

    set(obj, key, result);

    return obj;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static translatedSplitNLDependent<T extends object>(obj: T, key: string): T {
    // let result = Decomposition.translatedBaseSplit(obj, key);
    const splitFn = (data: unknown): unknown[] => {
      const translations = split(get(data, 'translation'), '\n');
      const language = get(data, 'language');
      return map(translations, (i) => ({ language, translation: i }));
    };

    const fn = (data: unknown[]): unknown[] =>
      map(zip(...transform(data, (result, i) => result.push(splitFn(i)), [])), (translations) => ({ translations }));

    const data = get(get(obj, key), 'translations');
    set(obj, key, fn(data));
    return obj;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static translatedBaseComponentSplit<T extends object>(obj: T): any {
    const data = get(obj, 'translations');

    const res = map(data, (entry) => {
      const lang = get(entry, TRANS_LANG_PROPERTY);
      const comp = get(entry, TRANS_VALUE_PROPERTY);
      const result = Mappings.mapComponent(comp);
      set(result, 'translations', [
        {
          language: lang,
          translation: get(result, 'name')
        }
      ]);

      return omit(result, 'name');
    });

    return Decomposition.mergeTranslatedObject(res);
  }

  public static translatedBaseLoEnergyComponentSplit(entry: any) {
    const lang = get(entry, TRANS_LANG_PROPERTY);
    const comp = get(entry, TRANS_VALUE_PROPERTY);

    const result = map(Mappings.mapLoEnergySelectionComponent(comp), (i) => {
      set(i, 'translations', [
        {
          language: lang,
          translation: get(i, 'name')
        }
      ]);
      return omit(i, 'name');
    });

    return result;
  }

  public static translatedBaseLoComponentSplit(entry: any) {
    const lang = get(entry, TRANS_LANG_PROPERTY);
    const comp = get(entry, TRANS_VALUE_PROPERTY);

    const result = map(Mappings.mapLoSelectionComponent(comp), (i) => {
      set(i, 'translations', [
        {
          language: lang,
          translation: get(i, 'name')
        }
      ]);
      return omit(i, 'name');
    });

    return result;
  }

  public static mergeTranslatedObject(data: any) {
    const trans = cloneDeep(flatten(map(data, 'translations')));
    const res = omit(mergeByArray(data), 'translations');
    set(res, 'translations', trans);
    return res;
  }

  public static translatedLoComponentSplit(obj: any, key: string) {
    // console.debug('noCAL', JSON.stringify(obj), key);
    const data = get(obj, key + TRANS_PROPERTY);
    let res = cloneDeep(map(data, Decomposition.translatedBaseLoComponentSplit));
    res = unzip(res);
    // eslint-disable-next-line prefer-const
    let res1 = map(res, Decomposition.mergeTranslatedObject);
    set(obj, key, res1);
    // console.debug('result', obj);

    return obj;
  }

  public static translatedLoEnergyComponentSplit(obj: any, key: string) {
    // console.debug('noCAL', JSON.stringify(obj), key);
    const data = get(obj, key + TRANS_PROPERTY);
    let res = cloneDeep(map(data, Decomposition.translatedBaseLoEnergyComponentSplit));
    res = unzip(res);
    // eslint-disable-next-line prefer-const
    let res1 = map(res, Decomposition.mergeTranslatedObject);
    set(obj, key, res1);
    // console.debug('result', obj);

    return obj;
  }

  public static translatedComponentsSplit(obj: any, key: string) {
    const data = get(obj, key);
    const result = cloneDeep(map(data, Decomposition.translatedBaseComponentSplit));
    set(obj, key, result);

    return obj;
  }
}
