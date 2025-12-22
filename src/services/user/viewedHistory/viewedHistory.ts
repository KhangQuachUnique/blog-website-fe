import axios from "../../../config/axiosCustomize";

export const recordViewedPost = async (postId: number): Promise<void> => {
  try {
    // Fire-and-forget: backend records the view, we don't need the response here
    await axios.post(`/viewed-history/posts/${postId}/view`);
  } catch (err) {
    // swallow errors to avoid breaking UX; log for debugging
    // eslint-disable-next-line no-console
    console.debug("recordViewedPost failed", err);
  }
};
