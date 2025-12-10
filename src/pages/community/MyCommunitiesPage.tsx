import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  getMyCommunities,
  createCommunity,
  type MyCommunity,
} from "./communityList.api";

const MyCommunitiesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<MyCommunity[]>({
    queryKey: ["myCommunities"],
    queryFn: getMyCommunities,
  });

  const communities = data ?? [];

  // state cho modal tạo cộng đồng
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const createMutation = useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCommunities"] });
      setOpenCreate(false);
      setCreateForm({ name: "", description: "", isPublic: true });
    },
  });

  const handleOpenCommunity = (community: MyCommunity) => {
    // Tạm thời: tất cả đều đi tới manage của community đó
    // sau này nếu có trang view riêng cho member thì bạn tách ra
    navigate(`/community/manage/${community.id}`);
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

    createMutation.mutate({
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      isPublic: createForm.isPublic,
      // tạm dùng thumbnail mặc định, sau này làm upload ảnh sau
      thumbnailUrl: "https://picsum.photos/seed/community/300/300",
    });
  };

  return (
    <div className="community-page">
      {/* Header */}
      <header className="community-header">
        <h2 className="community-header-title">Cộng đồng của bạn</h2>
        <p className="community-header-sub">
          Xem các cộng đồng bạn đang tham gia và tạo cộng đồng mới.
        </p>
      </header>

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {communities.map((c) => (
            <button
              key={c.id}
              className="community-card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
              onClick={() => handleOpenCommunity(c)}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <img
                  src={c.thumbnailUrl}
                  alt=""
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      fontSize: 15,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#777",
                      marginBottom: 4,
                    }}
                  >
                    {c.memberCount} thành viên ·{" "}
                    {c.isPublic ? "Công khai" : "Riêng tư"}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      background:
                        c.role === "ADMIN" || c.role === "MODERATOR"
                          ? "#ffe4f1"
                          : "#e3f2fd",
                      color:
                        c.role === "ADMIN" || c.role === "MODERATOR"
                          ? "#d81b60"
                          : "#1976d2",
                    }}
                  >
                    {c.role === "ADMIN"
                      ? "Admin"
                      : c.role === "MODERATOR"
                      ? "Moderator"
                      : "Thành viên"}
                  </div>
                </div>
              </div>

              {c.description && (
                <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
                  {c.description.length > 90
                    ? c.description.slice(0, 90) + "..."
                    : c.description}
                </p>
              )}
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
  );
};

export default MyCommunitiesPage;
