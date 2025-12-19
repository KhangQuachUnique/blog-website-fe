import axiosCustomize from "../../../config/axiosCustomize";

const unwrap = (res: any) => {
  if (res?.data?.data?.data) return res.data.data.data;
  if (res?.data?.data) return res.data.data;
  return res?.data || res;
};

export const getNewsfeed = async (after?: string | null, seed?: number) => {
  // Always include limit and seed to keep ordering stable during the session
  const limit = 15;
  const seedParam = typeof seed === "number" ? `&seed=${seed}` : "";
  const afterParam = after ? `&after=${after}` : "";
  const url = `/newsfeed?limit=${limit}${seedParam}${afterParam}`;
  console.debug("newsfeedService.getNewsfeed url=", url);
  const response = await axiosCustomize.get(url);
  try {
    // Try to stringify the response (useful for pasting here)
    const safe = JSON.stringify(response, (_k, v) => (typeof v === 'bigint' ? String(v) : v));
    console.debug("newsfeedService.getNewsfeed response (json)=", safe);
  } catch (e) {
    console.debug("newsfeedService.getNewsfeed response (raw)=", response);
  }

  const out = unwrap(response);
  try {
    console.debug("newsfeedService.getNewsfeed unwrapped=", JSON.stringify(out));
  } catch (e) {
    console.debug("newsfeedService.getNewsfeed unwrapped (raw)=", out);
  }
  console.log(out)
  return out;

};
