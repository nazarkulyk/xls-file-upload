export interface DetectRule {
  fields: string[];
}

export interface DetectProfile {
  type: string;
  keysRow: number;
  dataStart: number;
  sheetName: string;
  detect: DetectRule;
  validate: DetectRule;
}
