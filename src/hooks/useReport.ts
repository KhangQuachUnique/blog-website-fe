import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/toast';
import {
  createReport,
  checkIfReported,
  getAllReports,
  getPendingReports,
  getResolvedReports,
  resolveReport,
  resolveAllReportsByTarget,
  getReportsByPost,
  getReportDetail,
  getGroupedReports,
} from '../services/user/report/reportService';
import {
  type ICreateReportRequest,
  type ICheckReportedResponse,
  EReportType,
  type IReportResponse,
  type EReportStatus,
  type IGroupedReportListResponse,
} from '../types/report';

// ============================================
// QUERY KEYS
// ============================================
export const reportKeys = {
  all: ['reports'] as const,
  pending: ['reports', 'pending'] as const,
  resolved: ['reports', 'resolved'] as const,
  detail: (reportId: number) => ['reports', 'detail', reportId] as const,
  check: (type: EReportType, targetId: number) => 
    [...reportKeys.all, 'check', type, targetId] as const,
  grouped: (status: string, type: string, page: number) => 
    ['reports', 'grouped', status, type, page] as const,
  byPost: (postId: number, status: string) => 
    ['reports', 'post', postId, status] as const,
};

// ============================================
// CHECK IF REPORTED HOOK
// ============================================
export interface UseCheckReportedOptions {
  type: EReportType;
  targetId: number;
  enabled?: boolean;
}

export const useCheckReported = ({
  type,
  targetId,
  enabled = true,
}: UseCheckReportedOptions) => {
  return useQuery<ICheckReportedResponse>({
    queryKey: reportKeys.check(type, targetId),
    queryFn: () => checkIfReported(type, targetId),
    enabled: enabled && !!targetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================
// CREATE REPORT HOOK
// ============================================
export interface UseCreateReportOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateReport = (options?: UseCreateReportOptions) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: ICreateReportRequest) => createReport(data),
    onSuccess: (response, variables) => {
      // Invalidate the check query for this target
      queryClient.invalidateQueries({
        queryKey: reportKeys.check(variables.type, getTargetId(variables)),
      });

      queryClient.invalidateQueries({ queryKey: ['reports', 'grouped'] });

      showToast({
        type: 'success',
        message: response.message || 'Báo cáo đã được gửi thành công',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const message = (error as any)?.response?.data?.message || 
        'Không thể gửi báo cáo. Vui lòng thử lại.';
      showToast({
        type: 'error',
        message,
      });
      options?.onError?.(error);
    },
  });
};

// Helper to get target ID from request
const getTargetId = (data: ICreateReportRequest): number => {
  if (data.reportedPostId) return data.reportedPostId;
  if (data.reportedCommentId) return data.reportedCommentId;
  if (data.reportedUserId) return data.reportedUserId;
  return 0;
};


// ============================================
// GET REPORTS LIST HOOKS
// ============================================

// Get ALL reports
export const useGetAllReports = () => {
  return useQuery<IReportResponse[]>({
    queryKey: reportKeys.all,
    queryFn: getAllReports,
  });
};

// Get PENDING reports
export const useGetPendingReports = () => {
  return useQuery<IReportResponse[]>({
    queryKey: reportKeys.pending,
    queryFn: getPendingReports,
  });
};

// Get RESOLVED reports
export const useGetResolvedReports = () => {
  return useQuery<IReportResponse[]>({
    queryKey: reportKeys.resolved,
    queryFn: getResolvedReports,
  });
};

/**
 * 📊 Hook lấy danh sách báo cáo đã NHÓM (Dùng cho trang Admin)
 */
export const useGetGroupedReports = (
  status: EReportStatus | string,
  type: EReportType | string | 'ALL' = 'ALL',
  page: number = 1,
  limit: number = 10,
  enabled: boolean = true
) => {
  return useQuery<IGroupedReportListResponse>({
    queryKey: reportKeys.grouped(status, type, page),
    queryFn: () => getGroupedReports(status, type, page, limit),
    enabled: enabled && !!status,
    placeholderData: (previousData) => previousData, 
    staleTime: 60 * 1000, 
  });
};

/**
 * Hook to get reports for a specific post
 */
export const useGetReportsByPost = (
  postId: number, 
  status?: EReportStatus | string
) => {
  return useQuery({
    queryKey: reportKeys.byPost(postId, status || "ALL"),
    queryFn: () => getReportsByPost(postId, status),
    enabled: Number.isFinite(postId) && postId > 0,
    placeholderData: (previousData) => previousData,
  });
};

// ============================================
// RESOLVE REPORT HOOKS
// ============================================

// 1. Resolve Single Report
interface ResolveReportVariables {
  id: number;
  type: EReportType;
  action: 'APPROVE' | 'REJECT';
}

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, type, action }: ResolveReportVariables) => 
      resolveReport(id, type, action),

    onSuccess: (_data, variables) => {
      const actionText = variables.action === 'APPROVE' ? 'Chấp thuận' : 'Từ chối';
      showToast({
        type: 'success',
        message: `Đã ${actionText} báo cáo thành công!`,
      });

      // Làm mới danh sách report chung
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: ['reports', 'grouped'] });
      // Làm mới danh sách report của post cụ thể (nếu đang ở trong Modal)
      queryClient.invalidateQueries({ queryKey: ['reports', 'post'] });
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Lỗi khi xử lý báo cáo';
      showToast({
        type: 'error',
        message,
      });
    },
  });
};

// 2. Resolve ALL Reports by Target (NEW HOOK)
interface ResolveAllReportsVariables {
  targetId: number;
  type: EReportType;
  action: 'APPROVE' | 'REJECT';
}

export const useResolveAllReportsByTarget = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ targetId, type, action }: ResolveAllReportsVariables) => 
      resolveAllReportsByTarget(targetId, type, action),

    onSuccess: (data, variables) => {
      showToast({
        type: 'success',
        message: data.message,
      });

      queryClient.invalidateQueries({ queryKey: ['reports', 'grouped'] });

      if (variables.type === EReportType.POST) {
        queryClient.invalidateQueries({ 
            queryKey: ['reports', 'post', variables.targetId] 
        });

        if (variables.action === 'APPROVE') {
           queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      }
    },

    onError: (error: any) => {
      const message = error?.message || 'Lỗi khi xử lý hàng loạt';
      showToast({
        type: 'error',
        message,
      });
    },
  });
};

// ============================================
// GET REPORT DETAIL HOOK
// ============================================
export const useReportDetail = (reportId: number, enabled: boolean = false) => {
  return useQuery<IReportResponse>({
    queryKey: reportKeys.detail(reportId),
    queryFn: () => getReportDetail(reportId),
    enabled: enabled && reportId > 0,
    staleTime: 5 * 60 * 1000, 
  });
};