/**
 * 🚨 Report Types
 */

// Enum for report types
export const EReportType = {
  USER: 'USER',
  POST: 'POST',
  COMMENT: 'COMMENT',
} as const;

export type EReportType = (typeof EReportType)[keyof typeof EReportType];

// Reporter summary
export interface IReporterSummary {
  id: number;
  username: string;
  avatarUrl?: string;
}

// Reported user summary
export interface IReportedUserSummary {
  id: number;
  username: string;
  avatarUrl?: string;
}

// Reported post summary
export interface IReportedPostSummary {
  id: number;
  title: string;
  thumbnailUrl?: string;
}

// Reported comment summary
export interface IReportedCommentSummary {
  id: number;
  contentPreview: string;
}

// Full report response
export interface IReportResponse {
  id: number;
  reason: string;
  type: EReportType;
  createdAt: string;
  reporter: IReporterSummary;
  reportedUser?: IReportedUserSummary;
  reportedPost?: IReportedPostSummary;
  reportedComment?: IReportedCommentSummary;
}

// Report list with pagination
export interface IReportListResponse {
  items: IReportResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Create report response
export interface ICreateReportResponse {
  message: string;
  reportId: number;
}

// Check if reported response
export interface ICheckReportedResponse {
  isReported: boolean;
  reportId?: number;
}

// Create report request
export interface ICreateReportRequest {
  reason: string;
  type: EReportType;
  reportedPostId?: number;
  reportedCommentId?: number;
  reportedUserId?: number;
}

// Predefined report reasons
export const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam hoặc quảng cáo' },
  { value: 'VIOLENCE', label: 'Bạo lực hoặc nội dung gây hại' },
  { value: 'HARASSMENT', label: 'Quấy rối hoặc bắt nạt' },
  { value: 'HATE_SPEECH', label: 'Ngôn từ thù địch' },
  { value: 'MISINFORMATION', label: 'Thông tin sai lệch' },
  { value: 'SEXUAL_CONTENT', label: 'Nội dung khiêu dâm' },
  { value: 'COPYRIGHT', label: 'Vi phạm bản quyền' },
  { value: 'OTHER', label: 'Lý do khác' },
] as const;

export type ReportReasonValue = (typeof REPORT_REASONS)[number]['value'];
