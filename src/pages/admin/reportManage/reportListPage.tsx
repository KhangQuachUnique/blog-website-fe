import { useEffect, useMemo, useState } from 'react';
import { BiRefresh, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Toast from '../../../components/Toast/Toast';

type User = {
  id: number;
  username?: string;
  email?: string;
};

type BlogPost = {
  id: number;
  title: string;
  author?: User;
};

type Comment = {
  id: number;
  content: string;
  commenter?: User;
};

type Report = {
  id: number;
  reason: string;
  type: 'USER' | 'COMMENT' | 'POST';
  createdAt: string;
  reporter: User | null;
  reportedUser: User | null;
  reportedComment: Comment | null;
  reportedPost: BlogPost | null;
};

type ReportFilter = 'ALL' | 'USER' | 'COMMENT' | 'POST';

const ITEMS_PER_PAGE = 10;

const ReportListPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<ReportFilter>('ALL');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    text: '',
  });

  const showToast = (type: any, text: string) => {
    setToastConfig({ type, text });
    setToastOpen(true);
  };

  // ================= FETCH =================
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8080/reports');
      if (!response.ok) throw new Error('Lỗi khi tải danh sách report');

      const data = await response.json();
      const reportArray: Report[] = Array.isArray(data)
        ? data
        : data?.data || data?.items || [];

      setReports(reportArray);
      setCurrentPage(1);
      showToast('success', 'Tải report thành công');
    } catch (err: any) {
      setError(err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  // ================= FILTER =================
  const filteredReports = useMemo(() => {
    if (filterType === 'ALL') return reports;
    return reports.filter(r => r.type === filterType);
  }, [reports, filterType]);

  // ================= COUNT =================
  const totalByType = useMemo(() => {
    return {
      ALL: reports.length,
      USER: reports.filter(r => r.type === 'USER').length,
      COMMENT: reports.filter(r => r.type === 'COMMENT').length,
      POST: reports.filter(r => r.type === 'POST').length,
    };
  }, [reports]);

  const reportCountByTarget = useMemo(() => {
    return filteredReports.reduce<Record<number, number>>((acc, r) => {
      const targetId =
        r.type === 'POST'
          ? r.reportedPost?.id
          : r.type === 'COMMENT'
          ? r.reportedComment?.id
          : r.reportedUser?.id;

      if (targetId) {
        acc[targetId] = (acc[targetId] || 0) + 1;
      }
      return acc;
    }, {});
  }, [filteredReports]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <AiOutlineLoading3Quarters size={40} className="animate-spin text-pink-500" />
      </div>
    );
  }

  // ================= ERROR =================
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchReports} className="px-4 py-2 bg-pink-500 text-white rounded">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">🚨 Quản lý Report</h1>
          <p className="text-gray-500 mt-1">Report User / Comment / Post</p>
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-5 py-2 bg-pink-500 text-white rounded-full"
        >
          <BiRefresh size={18} /> Làm mới
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-3 mb-6">
        {(['ALL', 'USER', 'COMMENT', 'POST'] as ReportFilter[]).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full font-semibold ${
              filterType === type
                ? 'bg-pink-500 text-white'
                : 'bg-white border'
            }`}
          >
            {type} ({totalByType[type]})
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-pink-50">
            <tr>
              <th className="p-4 text-left">Đối tượng bị report</th>
              <th className="p-4 text-center">Số lượt</th>
              <th className="p-4 text-left">Người report</th>
              <th className="p-4 text-left">Lý do</th>
              <th className="p-4 text-center">Thời gian</th>
            </tr>
          </thead>

          <tbody>
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Không có report
                </td>
              </tr>
            ) : (
              paginatedReports.map(report => {
                let targetLabel = '—';
                let targetId: number | undefined;

                if (report.type === 'USER') {
                  targetId = report.reportedUser?.id;
                  targetLabel =
                    report.reportedUser?.username ||
                    report.reportedUser?.email ||
                    'User ẩn danh';
                }

                if (report.type === 'COMMENT') {
                  targetId = report.reportedComment?.id;
                  targetLabel = `${report.reportedComment?.content || '(Không nội dung)'} 
                  — ${report.reportedComment?.commenter?.username || 'Ẩn danh'}`;
                }

                if (report.type === 'POST') {
                  targetId = report.reportedPost?.id;
                  targetLabel = `${report.reportedPost?.title} 
                  — ${report.reportedPost?.author?.username || 'Ẩn danh'}`;
                }

                return (
                  <tr key={report.id} className="border-t hover:bg-pink-50">
                    {/* Đối tượng bị report */}
                    <td className="p-4 font-medium">{targetLabel}</td>

                    {/* Số lượt report */}
                    <td className="p-4 text-center font-bold text-pink-600">
                      {targetId ? reportCountByTarget[targetId] : 0}
                    </td>

                    {/* Người report */}
                    <td className="p-4">
                      {report.reporter?.username ||
                        report.reporter?.email ||
                        'Ẩn danh'}
                    </td>

                    {/* Lý do */}
                    <td className="p-4 text-gray-600 truncate max-w-md">
                      {report.reason}
                    </td>

                    {/* Thời gian */}
                    <td className="p-4 text-center text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded disabled:opacity-50"
          >
            <BiChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page ? 'bg-pink-500 text-white' : 'border'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border rounded disabled:opacity-50"
          >
            <BiChevronRight />
          </button>
        </div>
      )}

      <Toast
        open={toastOpen}
        type={toastConfig.type}
        message={toastConfig.text}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default ReportListPage;
