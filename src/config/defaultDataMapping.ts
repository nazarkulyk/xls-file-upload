export const DEFAULT_MAPPING_TYPES = {
  Unknown: 'Unknown' as const
};

export type DEFAULT_MAPPING_TYPES = typeof DEFAULT_MAPPING_TYPES[keyof typeof DEFAULT_MAPPING_TYPES];

export type ConfigDataMapping = {
  fileName: string;
  outputFile: string;
  options: {
    keysRow: number;
    dataStart: number;
    sheet: string;
  };
  detect: {
    fields: string[];
  };
  validate: {
    fields: string[];
    fieldsShouldBe?: string[];
  };
  notRemoveUndescoreNumber?: boolean;
  translation?: Record<string, unknown>;
  filter?: string[];
  mappings?: Record<string, unknown>;
  aggregation?: {
    [key: string]: {
      byKeyNumbering?: string;
      byStartingString?: string;
    };
  };
  decomposition?: Record<string, unknown>;
  renameKeys?: {
    [key: string]: string;
  };
  calculate?: {
    [key: string]: string;
  };
  mergeWith?: Record<string, unknown>;
};

export type DefaultConfigDataMappings<T extends DEFAULT_MAPPING_TYPES> = {
  [key in T]: ConfigDataMapping;
};

export type ConfigDataMappings = {
  [key: string]: ConfigDataMapping;
};
