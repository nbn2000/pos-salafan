/**
 * Translates measurement types from English to Uzbek
 * @param type - The measurement type (KG, UNIT, etc.)
 * @returns The Uzbek translation
 */
export function translateMeasurementType(type: string): string {
  switch (type) {
    case 'KG':
      return 'kg';
    case 'UNIT':
      return 'DONA';
    case 'L':
      return 'Litr';
    case 'M':
      return 'Metr';
    case 'PIECE':
      return 'Dona';
    default:
      return type;
  }
}

/**
 * Measurement labels mapping for consistent usage across components
 */
export const measurementLabels: Record<string, string> = {
  KG: 'kg',
  UNIT: 'DONA',
  L: 'Litr',
  M: 'Metr',
  PIECE: 'Dona',
};
