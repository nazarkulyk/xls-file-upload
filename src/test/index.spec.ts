import { FileUploadResult } from 'src/models';
import { DEFAULT_MAPPING_TYPES, EXCEL_MIME_TYPES } from '../config';
import { UploadService } from '../upload';

const TransformTypes = {
  ...DEFAULT_MAPPING_TYPES,
  Test: 'Test' as const
};

type TransformTypes = typeof TransformTypes[keyof typeof TransformTypes];

type sometype<T extends TransformTypes> = T extends typeof TransformTypes.Unknown
  ? 'Unknown'
  : T extends typeof TransformTypes.Test
  ? 'Test'
  : never;

// type r = sometype<typeof TransformTypes.Test>;

class UploadTest extends UploadService<TransformTypes> {
  // eslint-disable-next-line class-methods-use-this
  protected validateFilePart(part: Express.Multer.File): Promise<FileUploadResult<never>> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  protected async importDBData(type: Transforms, data: unknown, truncate = true): Promise<number> {
    // eslint-disable-next-line no-console
    console.log(type, data, truncate);
    return 0;
  }
}

export const uploadTest = new UploadTest({ mimeTypes: EXCEL_MIME_TYPES });

// uploadTest.parseFileParts(req);
