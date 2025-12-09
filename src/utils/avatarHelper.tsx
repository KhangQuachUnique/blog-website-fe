// Helper function để tạo màu từ string
export function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

// Helper function để tạo avatar từ tên với size tùy chỉnh
export function stringAvatar(name: string, size: number = 120, fontSize: string = '2.5rem') {
  const nameParts = name.split(' ');
  let initials = '';
  
  // Lấy chữ cái đầu của từ đầu tiên
  if (nameParts.length > 0 && nameParts[0].length > 0) {
    initials += nameParts[0][0].toUpperCase();
  }
  
  // Lấy chữ cái đầu của từ cuối cùng (nếu có nhiều hơn 1 từ)
  if (nameParts.length > 1 && nameParts[nameParts.length - 1].length > 0) {
    initials += nameParts[nameParts.length - 1][0].toUpperCase();
  } else if (nameParts.length === 1 && nameParts[0].length > 1) {
    // Nếu chỉ có 1 từ, lấy 2 chữ cái đầu
    initials += nameParts[0][1].toUpperCase();
  }

  return {
    sx: {
      bgcolor: stringToColor(name),
      width: size,
      height: size,
      fontSize: fontSize,
      fontWeight: 'bold',
    },
    children: initials,
  };
}
