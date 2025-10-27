declare type ConversionRecord = {
  id: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  fromUnit: MeasureType;
  toUnit: MeasureType;
  multiplier: number;
};

declare type ConversionRecordList = ConversionRecord[];
