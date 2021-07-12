import { eq } from 'lodash';
import { ConfigDataMappings, DEFAULT_MAPPING_TYPES } from './config';
import { SheetBufferToJson } from './utils/sheetBufferToJson';
import { DataMapping } from './dataMapping';
import { FileUploadResult } from './models/fileUpload';

export abstract class ReadFileService {
  private transform = DataMapping;

  private transformations: ConfigDataMappings;

  private sheetService: SheetBufferToJson;

  public async parseFile(file: File): Promise<FileUploadResult> {
    const { type, valide, data } = await this.validateFilePart(file);
    if (valide) {
      const count = await this.importDBData(type, data, false);
      return { file: file.name, valide, type, count, data };
    }
    return { file: file.name, valide, type };
  }

  protected async validateExcel(file: File, transformations: ConfigDataMappings): Promise<FileUploadResult> {
    this.transformations = transformations;
    const { type, valide, data } = this.parseSheet(file);
    let mapped: unknown[] = [];
    if (valide) {
      mapped = await this.mapData(type, data);
    } else {
      // eslint-disable-next-line no-console
      console.error('File upload not valide:', file.name);
    }
    return { file: file.name, valide, type, data: mapped };
  }

  private parseSheet(file: File): { type: string; valide: boolean; data: unknown } {
    this.sheetService = new SheetBufferToJson(file, this.transformations);
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
      console.error('File type not valide');
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

  protected abstract validateFilePart(file: File): Promise<FileUploadResult>;
}
