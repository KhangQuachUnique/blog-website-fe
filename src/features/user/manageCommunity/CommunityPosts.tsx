import { useParams } from "react-router-dom";
import { useGetCommunityPosts } from "../../../hooks/usePost";
import { useGetCommunitySettings } from "../../../hooks/useCommunity";
import NewsfeedList from "../../../components/newsfeedList/NewsfeedList";

// ✅ ADDED: import type để cast cho đúng props của NewsfeedList
import type { INewsfeedItemDto } from "../../../types/newsfeed";

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

  if (isPrivateLocked) {
    return (
      <div className="community-card" style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>🔒 Cộng đồng riêng tư</div>
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
      <h3>Bài viết gần đây</h3>

      {list.length === 0 ? (
        <div className="community-card" style={{ marginTop: 12 }}>
          Chưa có bài viết nào trong cộng đồng này.
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {/* ✅ CHANGED: dùng lại đúng UI Newsfeed (Card) */}
          {/* ✅ ADDED: cast để khớp Props của NewsfeedList, KHÔNG sửa NewsfeedList */}
          <NewsfeedList posts={list as unknown as INewsfeedItemDto[]} />
        </div>
      )}
    </div>
  );
};

export default CommunityPosts;
