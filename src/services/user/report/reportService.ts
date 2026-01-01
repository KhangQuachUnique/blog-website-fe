import axios from '../../../config/axiosCustomize';
import type {
  ICreateReportRequest,
  ICreateReportResponse,
  ICheckReportedResponse,
  IReportResponse,
  IReportListResponse,
  EReportType,
  EReportStatus,
  IGroupedReportListResponse,
} from '../../../types/report';

/**
 * 🚨 Report Service
 * 
 * API calls for report functionality
 * Note: Axios interceptor already extracts response.data.data
 */

/**
 * Create a new report
 */
export const createReport = async (
  data: ICreateReportRequest
): Promise<ICreateReportResponse> => {
  const response = await axios.post('/reports', data);
  return response as unknown as ICreateReportResponse;
};

/**
 * Check if current user has reported a target
 */
export const checkIfReported = async (
  type: EReportType,
  targetId: number
): Promise<ICheckReportedResponse> => {
  const response = await axios.get('/reports/check', {
    params: { type, targetId },
  });
  return response as unknown as ICheckReportedResponse;
};

export const getAllReports = async (): Promise<IReportResponse[]> => {
  const response = await axios.get("/reports/all");
  return response as unknown as IReportResponse[];
};

/**
 * 📊 API: Lấy danh sách báo cáo đã NHÓM theo đối tượng (Admin)
 * Endpoint: GET /reports/grouped
 */
export const getGroupedReports = async (
  status: EReportStatus | string,
  type: EReportType | string | 'ALL',
  page = 1,
  limit = 10
): Promise<IGroupedReportListResponse> => {
  const params: any = { page, limit };
  
  // Chỉ gửi status nếu có (và khác ALL nếu UI bạn có option đó)
  if (status) params.status = status;
  
  // Nếu type là 'ALL', ta không gửi param type lên để BE tự fallback hoặc lấy hết
  // Nếu type cụ thể (POST/COMMENT/USER), gửi lên bình thường.
  if (type && type !== 'ALL') {
    params.type = type;
  }

  const response = await axios.get('/reports/grouped', { params });
  return response as unknown as IGroupedReportListResponse;
};

/**
 * ⚖️ Resolve a report (Approve/Reject)
 * Endpoint: PATCH /reports/:id/resolve
 * Body: { type, action }
 */
export const resolveReport = async (
  id: number,
  type: EReportType,
  action: 'APPROVE' | 'REJECT'
): Promise<IReportResponse> => {
  const response = await axios.patch(`/reports/${id}/resolve`, {
    type,
    action,
  });
  return response as unknown as IReportResponse;
};

/**
 * Get all reports (Admin) with pagination
 */
export const getReports = async (
  page = 1,
  limit = 20
): Promise<IReportListResponse> => {
  const response = await axios.get('/reports', {
    params: { page, limit },
  });
  return response as unknown as IReportListResponse;
};

/**
 * ⏳ Get pending reports
 * Endpoint: GET /reports/pending
 */
export const getPendingReports = async (): Promise<IReportResponse[]> => {
  const response = await axios.get("/reports/pending");
  return response as unknown as IReportResponse[];
};

/**
 * ✅ Get resolved reports
 * Endpoint: GET /reports/resolved
 */
export const getResolvedReports = async (): Promise<IReportResponse[]> => {
  const response = await axios.get("/reports/resolved");
  return response as unknown as IReportResponse[];
};

/**
 * Get reports for a specific post with optional status filter
 * @param postId ID bài viết
 * @param status (Optional) Trạng thái report (PENDING | RESOLVED)
 */
export const getReportsByPost = async (
  postId: number,
  status?: EReportStatus | string // Cho phép truyền Enum hoặc string
): Promise<IReportResponse[]> => {
  const response = await axios.get<IReportResponse[]>(`/reports/posts/${postId}`, {
    // Axios sẽ tự động ghép thành: /reports/posts/1?status=PENDING
    params: status ? { status } : {}, 
  });
  
  // Ép kiểu về mảng kết quả
  return response as unknown as IReportResponse[];
};

/**
 * Get report by ID
 */
export const getReportById = async (id: number): Promise<IReportResponse> => {
  const response = await axios.get(`/reports/${id}`);
  return response as unknown as IReportResponse;
};

/**
 * Delete a report (Admin)
 */
export const deleteReport = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete(`/reports/${id}`);
  return response as unknown as { message: string };
};

/**
 * Get detailed information about a report
 * @param reportId - The ID of the report
 * @returns Promise with report detail data
 */
export const getReportDetail = async (reportId: number): Promise<IReportResponse> => {
  try {
    const response = await axios.get<IReportResponse>(
      `/admin/reports/${reportId}`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching report detail for ID ${reportId}:`, error);
    throw error;
  }
};

/**
 * Get full content of a reported user
 * @param reportId - The ID of the report
 * @returns Promise with user content data
 */
export const getReportedUserContent = async (reportId: number) => {
  try {
    const response = await axios.get(
      `/admin/reports/${reportId}/content/user`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching user content for report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Get full content of a reported post
 * @param reportId - The ID of the report
 * @returns Promise with post content data
 */
export const getReportedPostContent = async (reportId: number) => {
  try {
    const response = await axios.get(
      `/admin/reports/${reportId}/content/post`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching post content for report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Get full content of a reported comment
 * @param reportId - The ID of the report
 * @returns Promise with comment content data
 */
export const getReportedCommentContent = async (reportId: number) => {
  try {
    const response = await axios.get(
      `/admin/reports/${reportId}/content/comment`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching comment content for report ${reportId}:`,
      error
    );
    throw error;
  }
};