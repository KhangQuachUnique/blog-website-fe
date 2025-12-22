import { FiSearch, FiTrendingUp } from "react-icons/fi";

interface TopKeyword {
  keyword: string;
  count: number;
}

interface TopKeywordsWidgetProps {
  keywords: TopKeyword[];
  isLoading?: boolean;
}

const TopKeywordsWidget = ({ keywords, isLoading = false }: TopKeywordsWidgetProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FiSearch className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Top Từ Khóa Tìm Kiếm</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="w-12 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!keywords || keywords.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FiSearch className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Top Từ Khóa Tìm Kiếm</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <FiSearch className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">Chưa có dữ liệu tìm kiếm</p>
        </div>
      </div>
    );
  }

  // Tính max count để normalize cho progress bar
  const maxCount = Math.max(...keywords.map((k) => k.count));

  // Màu sắc cho top positions
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
          bar: "bg-yellow-400",
        };
      case 1:
        return {
          badge: "bg-gray-100 text-gray-600 border-gray-200",
          bar: "bg-gray-400",
        };
      case 2:
        return {
          badge: "bg-orange-100 text-orange-600 border-orange-200",
          bar: "bg-orange-400",
        };
      default:
        return {
          badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
          bar: "bg-indigo-400",
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FiSearch className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Top Từ Khóa Tìm Kiếm</h3>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <FiTrendingUp className="w-3 h-3" />
          Top {keywords.length}
        </span>
      </div>

      {/* Keywords List */}
      <div className="space-y-3">
        {keywords.map((item, index) => {
          const style = getRankStyle(index);
          const percentage = (item.count / maxCount) * 100;

          return (
            <div key={item.keyword} className="group">
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <span
                  className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full border ${style.badge}`}
                >
                  {index + 1}
                </span>

                {/* Keyword & Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate group-hover:text-indigo-600 transition-colors">
                      {item.keyword}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 ml-2">
                      {item.count.toLocaleString()} lượt
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Tổng: {keywords.reduce((sum, k) => sum + k.count, 0).toLocaleString()} lượt tìm kiếm
        </p>
      </div>
    </div>
  );
};

export default TopKeywordsWidget;
