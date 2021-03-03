import { read, WorkBook, utils, Range } from 'xlsx';
import { get, drop, difference, every, find, includes, keys, transform, compact, head } from 'lodash';
import { ConfigDataMappings, DEFAULT_MAPPING_TYPES, MAX_XSLS_COLUMNS, MAX_XSLS_ROWS } from '../config';
import { DetectRule, DetectProfile } from '../models/detect';

export class SheetBufferToJson {
  private transformations: ConfigDataMappings;

  private workBook: WorkBook;

  private DetectMatch: DetectProfile[];

  private Valide = false;

  private Type: string = DEFAULT_MAPPING_TYPES.Unknown;

  public constructor(buf: Buffer, transformations: ConfigDataMappings) {
    this.transformations = transformations;
    this.DetectMatch = this.transformDetection();
    this.workBook = read(buf);
  }

  private transformDetection(): DetectProfile[] {
    return transform(
      this.transformations,
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      (result, opts, key) => {
        result.push({
          type: key,
          sheetName: get(opts, 'options.sheet'),
          keysRow: get(opts, 'options.keysRow'),
          dataStart: get(opts, 'options.dataStart'),
          detect: get(opts, 'detect'),
          validate: get(opts, 'validate')
        });
      },
      []
    );
  }

  public toJson(): unknown[] {
    if (!this.Valide) {
      throw new Error('Cant convert Sheet to JSON before validation!');
    }
    const { sheetName, dataStart, keysRow } = find(this.DetectMatch, ['type', this.Type]);
    const originalRange = utils.decode_range(this.workBook.Sheets[sheetName]['!ref']);
    const range = {
      s: {
        c: 0,
        r: keysRow
      },
      e: {
        c: originalRange.e.c > 120 ? 120 : originalRange.e.c,
        r: originalRange.e.r > 1024 ? 1024 : originalRange.e.r
      }
    };
    const data = utils.sheet_to_json(this.workBook.Sheets[sheetName], {
      range,
      defval: undefined
    });
    return dataStart > 0 ? drop(data, dataStart) : data;
  }

  public getType(): string {
    this.Type = this.detect();
    return this.Type;
  }

  public validate(): boolean {
    const { sheetName, keysRow, validate } = find(this.DetectMatch, ['type', this.Type]);
    this.Valide = this.checkDetectRule(sheetName, keysRow, validate);
    return this.Valide;
  }

  private detect(): string {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const t = find(this.DetectMatch, (opt) => {
      const { sheetName, keysRow, detect } = opt;
      return this.includesSheetName(sheetName) && this.checkDetectRule(sheetName, keysRow, detect);
    });

    return t ? t.type : DEFAULT_MAPPING_TYPES.Unknown;
  }

  private includesSheetName(sheetName: string): boolean {
    return includes(this.workBook.SheetNames, sheetName);
  }

  private checkDetectRule(sheetName: string, keysRow: number, rule: DetectRule): boolean {
    const originalRange = utils.decode_range(this.workBook.Sheets[sheetName]['!ref']);
    const range = {
      s: {
        c: 0,
        r: keysRow
      },
      e: {
        c: originalRange.e.c > 120 ? 120 : originalRange.e.c,
        r: originalRange.e.r > 1024 ? 1024 : originalRange.e.r
      }
    };
    const sheetData = utils.sheet_to_json(this.workBook.Sheets[sheetName], {
      range,
      blankrows: true,
      defval: undefined
    });
    const columns = compact(keys(head(sheetData)));

    // console.debug('detection', sheetName, keysRow, columns, keysRow);

    const { fields } = rule;

    // console.debug('detection', fields, columns);

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const result = every(fields, (c) => includes(columns, c));
    if (!result) {
      // eslint-disable-next-line no-console
      console.error('Check Detect Rule:', fields, columns);
      // eslint-disable-next-line no-console
      console.error('difference: ', difference(fields, columns));
    }
    return result;
  }

  public createRange(sheetName: string, keysRow: number): Range {
    const originalRange = utils.decode_range(this.workBook.Sheets[sheetName]['!ref']);
    return {
      s: {
        c: 0,
        r: keysRow
      },
      e: {
        c: originalRange.e.c > MAX_XSLS_COLUMNS ? MAX_XSLS_COLUMNS : originalRange.e.c,
        r: originalRange.e.r > MAX_XSLS_ROWS ? MAX_XSLS_ROWS : originalRange.e.r
      }
    };
  }
}
