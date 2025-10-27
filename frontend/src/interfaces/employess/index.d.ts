declare type Employee = {
  id: string;
  name: string;
  position: string;
  salary: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

// Yaratish payloadi
declare type CreateEmployeePayload = {
  name: string;
  position: string;
  salary: number;
};

// Umumiy paginated javob
declare type PaginatedEmployeesResponse<T> = {
  results: T[];
  count: number;
  page: number;
  take: number;
  totalPages: number;
};

// Employees ro‘yxati javobi
declare type EmployeesListResponse = PaginatedEmployeesResponse<Employee>;
