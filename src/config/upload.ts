import { toLower } from 'lodash';

export const UPLOAD_CONFIG = {
  limits: {
    fileSize: 40 * 1024 * 1024, // 40 Mb
    files: 3
  },
  truncate: toLower(process.env.IMPORT_TRUNCATED) === 'true'
};

export const EXCEL_MIME_TYPES = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
