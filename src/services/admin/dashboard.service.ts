import axiosInstance from "../../config/axiosCustomize";

// Types
export type EPeriod = "today" | "7days" | "30days" | "custom";

export interface DashboardFilterParams {
  period?: EPeriod;
  startDate?: string;
  endDate?: string;
}

export interface StatsCard {
  totalUsers: number;
  newUsers: number;
  totalPosts: number;
  newPosts: number;
  totalComments: number;
  newComments: number;
  totalCommunities: number;
  totalInteractions: number;
}

export interface ChartDataPoint {
  date: string;
  count: number;
}

export interface DashboardCharts {
  userGrowth: ChartDataPoint[];
  postGrowth: ChartDataPoint[];
  commentGrowth: ChartDataPoint[];
}

export interface PeriodInfo {
  startDate: string;
  endDate: string;
  label: string;
}

export interface DashboardStatsResponse {
  stats: StatsCard;
  period: PeriodInfo;
}

export interface DashboardChartsResponse {
  charts: DashboardCharts;
  period: PeriodInfo;
}

// API Functions
export const dashboardApi = {
  /**
   * Get dashboard statistics (cards data)
   */
  getStats: async (
    filter: DashboardFilterParams = {}
  ): Promise<DashboardStatsResponse> => {
    const params = new URLSearchParams();
    if (filter.period) params.append("period", filter.period);
    if (filter.startDate) params.append("startDate", filter.startDate);
    if (filter.endDate) params.append("endDate", filter.endDate);

    const response = await axiosInstance.get(
      `/api/admin/dashboard/stats?${params.toString()}`
    );
    return response as unknown as DashboardStatsResponse;
  },

  /**
   * Get chart data for dashboard
   */
  getCharts: async (
    filter: DashboardFilterParams = {}
  ): Promise<DashboardChartsResponse> => {
    const params = new URLSearchParams();
    if (filter.period) params.append("period", filter.period);
    if (filter.startDate) params.append("startDate", filter.startDate);
    if (filter.endDate) params.append("endDate", filter.endDate);

    const response = await axiosInstance.get(
      `/api/admin/dashboard/charts?${params.toString()}`
    );
    return response as unknown as DashboardChartsResponse;
  },
};

export default dashboardApi;
