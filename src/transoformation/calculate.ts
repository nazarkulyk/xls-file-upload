import { get, map, keys, transform, set, isFunction } from 'lodash';
import { divide, times } from 'number-precision';

export class Calculate {
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static parse(entries: any[], options: object): any[] {
    return map(entries, (entry) => {
      const extension = transform(
        keys(options),
        (result, key) => {
          const fn = get(options, key);
          if (isFunction(fn)) {
            return set(result, key, fn(key, entry));
          }
          return set(result, key, get(Calculate, get(options, key))(key, entry));
        },
        {}
      );

      return { ...entry, ...extension };
    });
  }

  public static applicationPgCheck(key: string, item: any): any {
    const pg = get(item, 'pg', 0);
    const dosage = get(item, 'standardDosage', 1);
    const value = divide(times(pg, dosage), 100);
    return value;
  }

  public static applicationEthanolCheck(key: string, item: any): any {
    const ethanol = get(item, 'ethanol', 0);
    const dosage = get(item, 'standardDosage', 1);
    const value = divide(times(ethanol, dosage), 100);
    return value;
  }

  public static flavorEnergyPgCheck(key: string, item: any): any {
    const pg = get(item, 'pg', 0);
    const dosage = get(item, 'dosage', 1);
    const value = divide(times(pg, dosage), 100);
    return value;
  }

  public static flavorEnergyEthanolCheck(key: string, item: any): any {
    const ethanol = get(item, 'ethanol', 0);
    const dosage = get(item, 'dosage', 1);
    const value = divide(times(ethanol, dosage), 100);
    return value;
  }
}
