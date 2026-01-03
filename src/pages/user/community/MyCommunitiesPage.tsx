import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import type { ICommunityResponse } from "../../../types/community";
import {
  useCreateCommunity,
  useGetMyCommunities,
} from "../../../hooks/useCommunity";
import "../../../styles/savedPosts/SavedPosts.css";
import { useAuthUser } from "../../../hooks/useAuth";
import LoginRequiredPage from "../../errors/LoginRequiredPage";

const MyCommunitiesPage = () => {
  const { isAuthenticated } = useAuthUser();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetMyCommunities();

  const communities = (data ?? []) as ICommunityResponse[];

  // state cho modal tạo cộng đồng
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const createMutation = useCreateCommunity();

  const handleOpenCommunity = (community: ICommunityResponse) => {
    // Tạm thời: tất cả đều đi tới manage của community đó
    // sau này nếu có trang view riêng cho member thì bạn tách ra
    navigate(`/community/${community.id}`);
  };

  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);

  const handleChangeCreateField = (
    field: "name" | "description" | "isPublic",
    value: string | boolean
  ) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      alert("Tên cộng đồng không được để trống");
      return;
    }

    createMutation.mutate(
      {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        isPublic: createForm.isPublic,
        thumbnailUrl: "",
      },
      {
        onSuccess: () => {
          setOpenCreate(false);
          setCreateForm({ name: "", description: "", isPublic: true });
        },
      }
    );
  };

  if (!isAuthenticated) {
    return <LoginRequiredPage />;
  }

  return (
    <div className="community-page">
      {/* ✅ WRAPPER để KHỚP kích cỡ với CommunityLayout.tsx (padding 150px) */}
      <div style={{ padding: "20px 150px" }}>
        {/* Header (styled like SavedPostsPage) */}
        <div className="saved-posts-header community-header">
          <div className="saved-posts-header__left">
            <Users size={28} className="saved-posts-header__icon" />
            <div>
              <h1 className="saved-posts-header__title">Cộng đồng của bạn</h1>
              <p className="saved-posts-header__count">
                {communities.length} cộng đồng
              </p>
            </div>
          </div>
        </div>

        {/* Thanh action: nút tạo cộng đồng */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Danh sách cộng đồng</h3>

          <button className="community-save-btn" onClick={handleOpenCreate}>
            + Tạo cộng đồng mới
          </button>
        </div>

        {/* List communities */}
        {isLoading && <p style={{ color: "#888" }}>Đang tải cộng đồng...</p>}
        {isError && (
          <p style={{ color: "#f44336" }}>
            Lỗi khi tải danh sách cộng đồng. Thử lại sau nhé.
          </p>
        )}

        {!isLoading && !isError && communities.length === 0 && (
          <div className="community-card">
            <p style={{ marginBottom: 8 }}>
              Bạn chưa tham gia cộng đồng nào cả.
            </p>
            <button className="community-save-btn" onClick={handleOpenCreate}>
              Bắt đầu bằng cách tạo cộng đồng đầu tiên
            </button>
          </div>
        )}

        {!isLoading && !isError && communities.length > 0 && (
          <div className="space-y-6">
            {communities.map((c) => (
              <button
                key={c.id}
                onClick={() => handleOpenCommunity(c)}
                className="bg-white text-gray-900 rounded-lg flex transform transition duration-150 border border-pink-100 overflow-hidden h-45 w-full hover:-translate-y-1  hover:ring-pink-100"
              >
                {/* Left: thumbnail fills full card height */}
                <div className="w-50 h-full flex-shrink-0">
                  {c.thumbnailUrl ? (
                    <img
                      src={c.thumbnailUrl}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                      {c.name?.[0] || "C"}
                    </div>
                  )}
                </div>

                {/* Right: content */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div className="min-w-0 pr-4">
                    <div className="text-2xl font-bold mb-4 truncate text-left">
                      {c.name}
                    </div>
                    {c.description && (
                      <div className="text-sm text-gray-600 line-clamp-2 overflow-hidden text-left">
                        {c.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Role badge on the left (larger, softer color) */}
                    <div className="flex-shrink-0">
                      {c.role && c.role !== "NONE" && (
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            c.role === "ADMIN"
                              ? "bg-pink-100 text-pink-700"
                              : c.role === "MODERATOR"
                              ? "bg-amber-100 text-amber-700"
                              : c.role === "MEMBER"
                              ? "bg-sky-100 text-sky-700"
                              : c.role === "PENDING"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {c.role === "ADMIN"
                            ? "Admin"
                            : c.role === "MODERATOR"
                            ? "Moderator"
                            : c.role === "MEMBER"
                            ? "Thành viên"
                            : c.role === "PENDING"
                            ? "Chờ duyệt"
                            : "Bị khóa"}
                        </span>
                      )}
                    </div>

                    {/* Meta on the right */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end text-gray-600">
                        <Users size={18} />
                        <div className="text-sm font-medium">
                          {c.memberCount}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {c.isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modal tạo cộng đồng */}
        {openCreate && (
          <div className="community-modal-overlay" onClick={handleCloseCreate}>
            <div
              className="community-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="community-modal-close"
                onClick={handleCloseCreate}
              >
                ×
              </button>

              <h3 style={{ marginBottom: 12 }}>Tạo cộng đồng mới</h3>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
                Đặt tên, mô tả và chọn chế độ công khai cho cộng đồng của bạn.
              </p>

              <form onSubmit={handleSubmitCreate}>
                <div style={{ marginBottom: 12 }}>
                  <label className="community-field-label">Tên cộng đồng</label>
                  <input
                    className="community-input"
                    value={createForm.name}
                    onChange={(e) =>
                      handleChangeCreateField("name", e.target.value)
                    }
                    placeholder="Ví dụ: React Việt Nam"
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label className="community-field-label">Mô tả</label>
                  <textarea
                    className="community-textarea"
                    value={createForm.description}
                    onChange={(e) =>
                      handleChangeCreateField("description", e.target.value)
                    }
                    placeholder="Giới thiệu ngắn gọn về cộng đồng của bạn..."
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="community-field-label">
                    Quyền riêng tư
                  </label>
                  <div className="community-radio-group">
                    <label>
                      <input
                        type="radio"
                        checked={createForm.isPublic}
                        onChange={() =>
                          handleChangeCreateField("isPublic", true)
                        }
                      />{" "}
                      Công khai (ai cũng xem được bài viết)
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        checked={!createForm.isPublic}
                        onChange={() =>
                          handleChangeCreateField("isPublic", false)
                        }
                      />{" "}
                      Riêng tư (chỉ thành viên xem được)
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                    onClick={handleCloseCreate}
                    disabled={createMutation.isPending}
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="community-save-btn"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Đang tạo..." : "Tạo cộng đồng"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCommunitiesPage;
