export {};

declare global {
  interface Meta {
    limit: number;
    page: number;
    totalElements: number;
    totalPages: number;
  }
  interface BackendRes<T> {
    status: string;
    path: string;
    statusCode: number;
    message: string;
    data?: T;
    meta?: Meta;
  }
  interface BackendResError {
    success: false;
    statusCode: number;
    path: string;
    timestamp: string;
    message: string;
  }
}
