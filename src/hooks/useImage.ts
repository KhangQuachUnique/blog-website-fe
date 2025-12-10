import { useCallback, useRef } from "react";

/**
 * Hook quản lý FormData cho việc upload ảnh
 * - Lưu trữ files với field name "files"
 * - Lưu trữ mảng keys tương ứng ("thumbnail" hoặc block id)
 */
export const useImageForm = () => {
  const formDataRef = useRef(new FormData());
  const keysRef = useRef<string[]>([]);

  /**
   * Thêm file vào FormData với key tương ứng
   */
  const appendFile = useCallback((key: string, file: File) => {
    const existingIndex = keysRef.current.indexOf(key);

    if (existingIndex !== -1) {
      // Key đã tồn tại -> rebuild FormData để cập nhật file
      const files = formDataRef.current.getAll("files") as File[];
      files[existingIndex] = file;

      formDataRef.current = new FormData();
      files.forEach((f) => formDataRef.current.append("files", f));
    } else {
      // Thêm file mới
      formDataRef.current.append("files", file);
      keysRef.current.push(key);
    }
  }, []);

  /**
   * Xóa file khỏi FormData theo key
   */
  const removeFile = useCallback((key: string) => {
    const index = keysRef.current.indexOf(key);
    if (index === -1) return;

    const files = formDataRef.current.getAll("files") as File[];
    files.splice(index, 1);
    keysRef.current.splice(index, 1);

    formDataRef.current = new FormData();
    files.forEach((f) => formDataRef.current.append("files", f));
  }, []);

  /**
   * Lấy FormData hiện tại
   */
  const getFormData = useCallback(() => formDataRef.current, []);

  /**
   * Lấy mảng keys hiện tại
   */
  const getKeys = useCallback(() => keysRef.current, []);

  /**
   * Reset FormData (gọi sau khi upload thành công)
   */
  const clear = useCallback(() => {
    formDataRef.current = new FormData();
    keysRef.current = [];
  }, []);

  /**
   * Kiểm tra có files cần upload không
   */
  const hasFiles = useCallback(() => keysRef.current.length > 0, []);

  return {
    appendFile,
    removeFile,
    getFormData,
    getKeys,
    clear,
    hasFiles,
  };
};

export default useImageForm;
