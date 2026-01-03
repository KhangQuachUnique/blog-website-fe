/**
 * Time Helper Utility for Vietnamese locale
 * Hiển thị thời gian theo chuẩn Việt Nam
 */

/**
 * Format thời gian tương đối theo tiếng Việt
 * - Nếu không quá 1 giờ: theo phút (vd: "5 phút trước")
 * - Nếu không quá 1 ngày: theo giờ (vd: "3 giờ trước")
 * - Nếu không quá 1 tuần: theo ngày (vd: "2 ngày trước")
 * - Nếu không quá 1 tháng: theo tuần (vd: "2 tuần trước")
 * - Nếu không quá 1 năm: theo tháng (vd: "3 tháng trước")
 * - Nếu quá 1 năm: theo tháng và năm (vd: "Tháng 5, 2023")
 */
export function formatRelativeTimeVi(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  // Nếu dưới 1 phút
  if (diffMin < 1) {
    return "vừa xong";
  }

  // Nếu không quá 1 giờ: theo phút
  if (diffMin < 60) {
    return `${diffMin} phút trước`;
  }

  // Nếu không quá 1 ngày: theo giờ
  if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  }

  // Nếu không quá 1 tuần: theo ngày
  if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  }

  // Nếu không quá 1 tháng: theo tuần
  if (diffDay < 30) {
    return `${diffWeek} tuần trước`;
  }

  // Nếu không quá 1 năm: theo tháng
  if (diffYear < 1) {
    return `${diffMonth} tháng trước`;
  }

  // Nếu quá 1 năm: theo tháng và năm
  return date.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Format ngày tháng đầy đủ theo tiếng Việt
 * Ví dụ: "15 tháng 5, 2023"
 */
export function formatDateVi(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format ngày tháng ngắn gọn theo tiếng Việt
 * Ví dụ: "15/05/2023"
 */
export function formatShortDateVi(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("vi-VN");
}

/**
 * Format thời gian theo tiếng Việt
 * Ví dụ: "14:30"
 */
export function formatTimeVi(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format ngày tháng và thời gian đầy đủ theo tiếng Việt
 * Ví dụ: "15 tháng 5, 2023 lúc 14:30"
 */
export function formatDateTimeVi(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const datePart = date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} lúc ${timePart}`;
}

/**
 * Format thời gian cho bình luận
 * - Nếu cùng ngày: hiển thị giờ (vd: "14:30")
 * - Nếu cùng năm: hiển thị ngày tháng (vd: "15 Th5")
 * - Nếu khác năm: hiển thị ngày tháng năm (vd: "15 Th5, 2023")
 */
export function formatCommentTimeVi(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();

  // Cùng ngày -> chỉ hiển thị giờ
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Cùng năm -> hiển thị ngày và tháng
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
    });
  }

  // Khác năm -> hiển thị ngày tháng năm
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
