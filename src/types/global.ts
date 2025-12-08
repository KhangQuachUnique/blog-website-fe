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
  interface IUser {
    id: number | string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: "ADMIN" | "USER";
    status: "ACTIVE" | "BANNED";
    avatar?: string;
    // Các trường phục vụ logic Ban
    bannedUntil?: string | null; // Ngày mở khóa
    banReason?: string | null;
  }
}
