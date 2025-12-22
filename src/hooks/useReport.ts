import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/toast';
import {
  createReport,
  checkIfReported,
  getAllReports,
} from '../services/user/report/reportService';
import type {
  ICreateReportRequest,
  ICheckReportedResponse,
  EReportType,
} from '../types/report';

// ============================================
// QUERY KEYS
// ============================================
export const reportKeys = {
  all: ['reports'] as const,
  check: (type: EReportType, targetId: number) => 
    [...reportKeys.all, 'check', type, targetId] as const,
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


// GET REPORTS LIST HOOK
export const useGetAllReports = () => {
  return useQuery({
      queryKey: ["reports"],
      queryFn: getAllReports,
    });
};