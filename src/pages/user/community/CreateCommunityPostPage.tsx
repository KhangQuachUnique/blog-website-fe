import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditPostForm from "../../../features/user/manageBlogPosts/editPostForm";
import { EPostType, type ICreateBlogPostDto } from "../../../types/post";
import { useCreatePost } from "../../../hooks/usePost";
import { useToast } from "../../../contexts/toast";
import { useAuthUser } from "../../../hooks/useAuth";
import { useGetCommunitySettings } from "../../../hooks/useCommunity";

const CreateCommunityPostPage = () => {
  const { user, isLoading, isAuthenticated } = useAuthUser();
  const { mutate } = useCreatePost();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const communityId = Number(id);

  // ✅ luôn gọi hooks đủ
  const safeCommunityId =
    Number.isFinite(communityId) && communityId > 0 ? communityId : 0;

  const { data: community, isLoading: isCommunityLoading } =
    useGetCommunitySettings(safeCommunityId);

  // validate id sau khi gọi hook
  if (!Number.isFinite(communityId) || communityId <= 0) {
    return <p>Community id không hợp lệ</p>;
  }

  if (isLoading || isCommunityLoading) {
    return <p>Đang tải...</p>;
  }

  if (!isAuthenticated || !user) {
    return <p>Bạn cần đăng nhập để tạo bài viết.</p>;
  }

  if (!community) {
    return <p>Không tìm thấy cộng đồng.</p>;
  }

  const role = community.role; // "ADMIN" | "MODERATOR" | "MEMBER" | "PENDING" | "NONE"
  const isMemberApproved =
    role === "ADMIN" || role === "MODERATOR" || role === "MEMBER";

  // ✅ chặn vào URL create-post nếu chưa được tham gia/duyệt
  useEffect(() => {
    if (!isMemberApproved) {
      showToast({
        type: "info",
        message: "Bạn cần tham gia cộng đồng để tạo bài viết.",
        duration: 2500,
      });
      navigate(`/community/${communityId}`, { replace: true });
    }
  }, [isMemberApproved, showToast, navigate, communityId]);

  // Trong lúc redirect, không render form
  if (!isMemberApproved) {
    return <p>Bạn cần tham gia cộng đồng để tạo bài viết.</p>;
  }

  const handlePublish = (dto: ICreateBlogPostDto) => {
    mutate(dto, {
      onSuccess: () => {
        showToast({
          type: "success",
          message: "Đăng bài thành công!",
        });
        navigate(`/community/${communityId}`);
      },
      onError: (err: any) => {
        showToast({
          type: "error",
          message: `Xảy ra lỗi khi đăng bài: ${err?.message ?? "Unknown error"}`,
        });
      },
    });
  };

  return (
    <EditPostForm
      mode="create"
      authorId={user.id}
      postType={EPostType.COMMUNITY}
      communityId={communityId}
      onPublish={handlePublish as (dto: unknown) => void}
    />
  );
};

export default CreateCommunityPostPage;
