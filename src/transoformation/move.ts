/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, map, keys, isFunction, omit } from 'lodash';
import { MoveFn } from '../config/defaultDataMapping';

export class Move {
  public static parse(entries: any[], options: { [key: string]: { [key: string]: string } | MoveFn }): any[] {
    return map(entries, (entry) => {
      let result = { ...entry };
      map(keys(options), (newKey) => {
        const moveOpts = get(options, newKey);
        let data = {};
        const fields: string[] = [];
        if (isFunction(moveOpts)) {
          data = moveOpts(entry, newKey);
          return;
        }
        map(keys(moveOpts), (key) => {
          const entryKey = get(moveOpts as { [key: string]: string }, key);
          data = { ...data, [key]: get(entry, entryKey) };
          fields.push(entryKey);
        });

        result = { ...omit(result, fields), [newKey]: data };
      });
      return result;
    });
  }
}
