import { useParams } from "react-router-dom";
import { useGetCommunityPosts } from "../../../hooks/usePost";
import { useGetCommunitySettings } from "../../../hooks/useCommunity";
import Card from "../../../components/card/Card";
import CustomButton from "../../../components/button";
import { useNavigate } from "react-router-dom";

const CommunityPosts = () => {
  const { id } = useParams();
  const communityId = Number(id);

  // check lock (community private + chưa join)
  const { data: settings } = useGetCommunitySettings(communityId);
  const role = settings?.role;
  const isMemberApproved =
    role === "ADMIN" || role === "MODERATOR" || role === "MEMBER";
  const isPrivateLocked = settings
    ? !settings.isPublic && !isMemberApproved
    : false;

  const { data: posts, isLoading, isError } = useGetCommunityPosts(communityId);
  const navigate = useNavigate();

  if (isPrivateLocked) {
    return (
      <div className="community-card" style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          🔒 Cộng đồng riêng tư
        </div>
        <div style={{ color: "#666", fontSize: 14 }}>
          Bạn cần tham gia để xem bài viết.
        </div>
      </div>
    );
  }

  if (isLoading) return <p style={{ marginTop: 20 }}>Đang tải bài viết...</p>;
  if (isError) return <p style={{ marginTop: 20 }}>Lỗi khi tải bài viết.</p>;

  const list = Array.isArray(posts) ? posts : [];

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Bài viết gần đây</h3>
        {isMemberApproved && (
          <CustomButton
            variant="outline"
            onClick={() => navigate(`/community/${communityId}/create-post`)}
            style={{
              border: "2px solid #F295B6",
              color: "#F295B6",
              width: "auto",
            }}
          >
            Tạo bài viết
          </CustomButton>
        )}
      </div>

      {list.length === 0 ? (
        <div className="community-card" style={{ marginTop: 12 }}>
          Chưa có bài viết nào trong cộng đồng này.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 22 }}>
          {list.map((p) => (
            <Card key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
};
export default CommunityPosts;
