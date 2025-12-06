import axiosCustomize from "../../../config/axiosCustomize";

export const getNewsfeed = async (after?: string | null) => {
  const url = after ? `/newsfeed?after=${after}` : "/newsfeed";
  const response = await axiosCustomize.get(url);
  return response;
};
