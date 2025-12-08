import axiosCustomize from "../../../config/axiosCustomize";

const unwrap = (res: any) => {
  if (res?.data?.data?.data) return res.data.data.data;
  if (res?.data?.data) return res.data.data;
  return res?.data || res;
};

export const getNewsfeed = async (after?: string | null) => {
  const url = after ? `/newsfeed?after=${after}` : "/newsfeed";
  const response = await axiosCustomize.get(url);
  return unwrap(response);
};
