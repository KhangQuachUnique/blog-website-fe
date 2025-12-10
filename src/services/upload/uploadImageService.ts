import axios from "../../config/axiosCustomize";

export const uploadFile = async (data: FormData): Promise<string> => {
  const response = await axios.post("/files/upload/image", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const uploadMultipleFiles = async (
  data: FormData,
  keys: string[]
): Promise<Record<string, string>> => {
  // Thêm keys vào FormData để backend biết mapping
  keys.forEach((key) => {
    data.append("keys", key);
  });

  const response = await axios.post<Record<string, string>>(
    "/files/upload/images",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response;
};
