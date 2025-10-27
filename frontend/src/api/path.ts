export enum AUTH {
  REGISTER = '/auth/users',
  LOGIN = '/auth/login',
  REFRESH = '/auth/refresh',
}

export enum LOGS {
  GET = '/logs/', //example /logs/?page=1
  GET_BY_ID = '/logs/', // example /logs/1/
}

export enum MERCHANT_DEBTS {
  GET = '/merchant-debts/overview/',
  PAY_DEBT = '/pay-merchant-debt/',
  GET_DEBT_PRODUCT_BATCH = '/merchant-debts/detail/',
  // POST = '/merchant-debts/',
  // GET_BY_ID = '/merchant-debts/', // example /merchant-debts/2/
  // PUT = '/merchant-debts/', // example /merchant-debts/2/
  // DELETE = '/merchant-debts/', // example /merchant-debts/2/
}

export enum PRODUCTS {
  GET = '/products/',
  POST = '/products/',
  POST_BY_SUPPLIER_ID = '/products/write-read/',
  UPLOAD_IMAGE = '/media/upload/',
  GET_BY_SUPPLIER_ID = '/products/write-read/',
  GET_BY_ID = '/products/',
  PATCH = '/products/modify/',
  DELETE = '/products/',
  DELETE_IMAGE = '/media/delete/',
}

export enum PRODUCT_BATCH {
  GET = '/product-batch/',
  POST = '/product-batch/',
  GET_BY_ID = '/product-batch/',
  PATCH = '/product-batch/',
  DELETE = '/product-batch/',
}

export enum WAREHAUSE {
  GET = '/warehouses',
  POST = '/warehouses',
  GET_BY_ID = '/warehouses/',
  PATCH = '/warehouses/',
  DELETE = '/warehouses/',
}

export enum SALE_PRODUCTS {
  GET = '/sale-products/',
  GET_BY_ID = '/sale-products/',
}

export enum SUPPLIERS {
  GET = '/suppliers/',
  POST = '/suppliers/',
  GET_BY_ID = '/suppliers/',
  PATCH = '/suppliers/',
  DELETE = '/suppliers/',
}

export enum DEBTORS {
  GET = '/debtors/',
  POST = '/debtors/',
  GET_BY_ID = '/debtors/',
  PATCH = '/debtors/',
  DELETE = '/debtors/',
}

export enum DEBTS {
  GET = '/debts/',
  POST = '/debts/',
  GET_BY_ID = '/debts/',
  PATCH = '/debts/',
  DELETE = '/debts/',
}

export enum SALES {
  GET = '/sales/',
  POST = '/sales/',
  GET_BY_ID = '/sales/',
  PATCH = '/sales/',
  DELETE = '/sales/',
  GET_SALE_INCOME = '/sales/merchant-sale-income/',
  GET_MY_SALE_INCOME = '/sales/my-income/',
}

export enum MERCHANTS {
  GET = '/merchants/',
  POST = '/merchants/',
  GET_BY_ID = '/merchants/',
  PATCH = '/merchants/',
  DELETE = '/merchants/',
}

export enum STATISTICS {
  GET = '/sales/analytics/',
}
