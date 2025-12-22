import { useState, useEffect, useCallback } from "react";
import { MdAutorenew } from "react-icons/md";
import {
  StatsCard,
  PeriodFilter,
  GrowthChart,
  ErrorState,
  EmptyState,
  TopKeywordsWidget,
} from "./components";
import dashboardApi, {
  type EPeriod,
  type DashboardStatsResponse,
  type DashboardChartsResponse,
  type TopKeywordsResponse,
} from "../../../services/admin/dashboard.service";

const DashboardPage = () => {
  // State
  const [period, setPeriod] = useState<EPeriod>("7days");
  const [statsData, setStatsData] = useState<DashboardStatsResponse | null>(null);
  const [chartsData, setChartsData] = useState<DashboardChartsResponse | null>(null);
  const [keywordsData, setKeywordsData] = useState<TopKeywordsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch stats, charts, and keywords in parallel
      const [stats, charts, keywords] = await Promise.all([
        dashboardApi.getStats({ period }),
        dashboardApi.getCharts({ period }),
        dashboardApi.getTopKeywords({ period }, 10),
      ]);

      setStatsData(stats);
      setChartsData(charts);
      setKeywordsData(keywords);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      // E1: API/DB Error
      setError("Cannot load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  // Fetch data on mount and when period changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle period change
  const handlePeriodChange = (newPeriod: EPeriod) => {
    setPeriod(newPeriod);
  };

  // Handle retry
  const handleRetry = () => {
    fetchDashboardData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center flex flex-col items-center gap-4">
          <MdAutorenew size={50} className="animate-spin text-pink-500" />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // E1: Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <PeriodFilter
          selectedPeriod={period}
          onPeriodChange={handlePeriodChange}
        />
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // E2: No data state
  const hasNoData =
    !statsData?.stats ||
    (statsData.stats.totalUsers === 0 &&
      statsData.stats.totalPosts === 0 &&
      statsData.stats.totalCommunities === 0);

  if (hasNoData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <PeriodFilter
          selectedPeriod={period}
          onPeriodChange={handlePeriodChange}
        />
        <EmptyState message="Không có dữ liệu thống kê để hiển thị" />
      </div>
    );
  }

  const { stats } = statsData!;
  const { charts } = chartsData!;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Period Filter */}
      <PeriodFilter
        selectedPeriod={period}
        onPeriodChange={handlePeriodChange}
        periodLabel={statsData?.period.label}
      />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Tổng Users"
          value={stats.totalUsers}
          subValue={stats.newUsers}
          subLabel="mới"
          icon="users"
          color="blue"
        />
        <StatsCard
          title="Tổng Bài viết"
          value={stats.totalPosts}
          subValue={stats.newPosts}
          subLabel="mới"
          icon="posts"
          color="green"
        />
        <StatsCard
          title="Tổng Comments"
          value={stats.totalComments}
          subValue={stats.newComments}
          subLabel="mới"
          icon="comments"
          color="purple"
        />
        <StatsCard
          title="Tổng Communities"
          value={stats.totalCommunities}
          icon="communities"
          color="orange"
        />
      </div>

      {/* Interaction Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatsCard
          title="Lượt tương tác"
          value={stats.totalInteractions}
          subLabel="trong kỳ"
          icon="interactions"
          color="pink"
        />
        <StatsCard
          title="Users mới"
          value={stats.newUsers}
          subLabel="trong kỳ"
          icon="growth"
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart
          title="Tăng trưởng Users"
          data={charts.userGrowth}
          color="#3B82F6"
        />
        <GrowthChart
          title="Tăng trưởng Bài viết"
          data={charts.postGrowth}
          color="#10B981"
        />
      </div>

      {/* Comment Chart - Full width */}
      <div className="mt-6">
        <GrowthChart
          title="Tăng trưởng Comments"
          data={charts.commentGrowth}
          color="#8B5CF6"
        />
      </div>

      {/* Top Keywords Widget */}
      <div className="mt-6">
        <TopKeywordsWidget
          keywords={keywordsData?.keywords || []}
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
