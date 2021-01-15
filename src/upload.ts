import { eq, includes, map } from 'lodash';
import { IncomingMessage } from 'http';
import { ConfigDataMappings, DEFAULT_MAPPING_TYPES } from './config';
import { SheetBufferToJson } from './utils/sheetBufferToJson';
import { DataMapping } from './dataMapping';
import { FileUploadResult } from './models/fileUpload';

type File = Express.Multer.File;
type Request = IncomingMessage & Express.Request;

export interface UploadServiceOptions {
  mimeTypes: string[];
}

export abstract class UploadService {
  private transform = DataMapping;

  private transformations: ConfigDataMappings;

  private sheetService: SheetBufferToJson;

  private mimeTypes: string[];

  constructor({ mimeTypes }: UploadServiceOptions) {
    this.mimeTypes = mimeTypes;
  }

  public async parseFileParts(parts: Request): Promise<FileUploadResult[]> {
    // const truncate = eq(toLower(get(parts.body, 'truncate', 'true')), 'true');
    return Promise.all(map(parts.files, async (file: File): Promise<FileUploadResult> => this.parseFilePart(file)));
  }

  public async parseFilePart(part: File): Promise<FileUploadResult> {
    const mimeValide = this.checkMimeType(part);
    if (mimeValide) {
      const { type, valide, data } = await this.validateFilePart(part);
      if (valide) {
        const count = await this.importDBData(type, data, false);
        return { file: part.originalname, valide, type, count, data };
      }
      return { file: part.originalname, valide, type };
    }
    return { file: part.originalname, valide: mimeValide };
  }

  protected async validateExcel(part: File, transformations: ConfigDataMappings): Promise<FileUploadResult> {
    this.transformations = transformations;
    const { type, valide, data } = this.parseSheet(part.buffer);
    let mapped: unknown[] = [];
    if (valide) {
      mapped = await this.mapData(type, data);
    } else {
      // eslint-disable-next-line no-console
      console.error('File upload not valide:', part.originalname);
    }
    return { file: part.originalname, valide, type, data: mapped };
  }

  private checkMimeType(file: File): boolean {
    return includes(this.mimeTypes, file.mimetype);
  }

  private parseSheet(buf: Buffer): { type: string; valide: boolean; data: unknown } {
    this.sheetService = new SheetBufferToJson(buf, this.transformations);
    const type = this.sheetService.getType();
    if (eq(type, DEFAULT_MAPPING_TYPES.Unknown)) {
      // eslint-disable-next-line no-console
      console.error('File upload type not found');
    } else {
      // eslint-disable-next-line no-console
      console.debug('Detected file Type:', type);
    }
    const valide = type !== DEFAULT_MAPPING_TYPES.Unknown ? this.sheetService.validate() : false;
    if (!valide) {
      // eslint-disable-next-line no-console
      console.error('File upload type not valide');
    }
    return {
      valide,
      type,
      data: valide ? this.sheetService.toJson() : []
    };
  }

  private async mapData(type: string, data: unknown): Promise<unknown[]> {
    return this.transform.run(type, this.transformations, data);
  }

  protected abstract importDBData(type: string, data: unknown, truncate: boolean): Promise<number>;

  protected abstract validateFilePart(part: File): Promise<FileUploadResult>;
}
