import { FileUploadResult } from '../models';
import { DEFAULT_MAPPING_TYPES, EXCEL_MIME_TYPES } from '../config';
import { UploadService } from '../upload';

type File = Express.Multer.File;

const TransformTypes = {
  ...DEFAULT_MAPPING_TYPES,
  Test: 'Test' as const
};

class UploadTest extends UploadService {
  // eslint-disable-next-line class-methods-use-this
  protected validateFilePart(part: File): Promise<FileUploadResult> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  protected async importDBData(type: string, data: unknown[], truncate = true): Promise<number> {
    // eslint-disable-next-line no-console
    console.log(type, data, truncate);
    return 0;
  }
}

export const uploadTest = new UploadTest({ mimeTypes: EXCEL_MIME_TYPES });

// uploadTest.parseFileParts(req);
