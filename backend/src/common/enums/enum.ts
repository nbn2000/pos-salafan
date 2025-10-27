export enum Role {
  ADMIN = 'ADMIN',
  WORKER = 'WORKER',
}

export enum MeasurementType {
  KG = 'KG',
  PIECE = 'UNIT',
}

export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
}

export enum Priority {
  HIGH = 'HIGH',
  LOW = 'LOW',
}

// Raw material log action types
export enum RawMaterialLogType {
  ADD = 'ADD',
  ADD_BATCH = 'ADD-BATCH',
  CHANGE = 'CHANGE',
  CHANGE_BATCH = 'CHANGE-BATCH',
  DELETE = 'DELETE',
  DELETE_BATCH = 'DELETE-BATCH',
}

// Product log action types (mirrors raw material)
export enum ProductLogType {
  ADD = 'ADD',
  ADD_BATCH = 'ADD-BATCH',
  CHANGE = 'CHANGE',
  CHANGE_BATCH = 'CHANGE-BATCH',
  DELETE = 'DELETE',
  DELETE_BATCH = 'DELETE-BATCH',
}
