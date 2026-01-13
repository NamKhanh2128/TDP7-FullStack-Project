/**
 * Format ngày giờ từ chuỗi ISO sang định dạng Tiếng Việt
 * Xử lý múi giờ 'Asia/Ho_Chi_Minh' để hiển thị đúng giờ địa phương
 * 
 * @param isoString - Chuỗi thời gian ISO từ Server (VD: "2025-12-29T20:00:00.000Z")
 * @returns Chuỗi định dạng "dd/MM/yyyy, HH:mm" (VD: "29/12/2025, 20:00")
 */
export const formatDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', isoString);
      return '';
    }
    
    // Format sang định dạng Việt Nam với múi giờ Asia/Ho_Chi_Minh
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format chỉ ngày (không có giờ)
 * 
 * @param isoString - Chuỗi thời gian ISO từ Server
 * @returns Chuỗi định dạng "dd/MM/yyyy" (VD: "29/12/2025")
 */
export const formatDate = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', isoString);
      return '';
    }
    
    return date.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format chỉ giờ (không có ngày)
 * 
 * @param isoString - Chuỗi thời gian ISO từ Server
 * @returns Chuỗi định dạng "HH:mm" (VD: "20:00")
 */
export const formatTime = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', isoString);
      return '';
    }
    
    return date.toLocaleTimeString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Format ngày giờ với format tùy chỉnh
 * 
 * @param isoString - Chuỗi thời gian ISO từ Server
 * @param options - Tùy chọn format (theo Intl.DateTimeFormatOptions)
 * @returns Chuỗi đã format theo options
 */
export const formatDateTimeCustom = (
  isoString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', isoString);
      return '';
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Ho_Chi_Minh',
      ...options,
    };
    
    return date.toLocaleString('vi-VN', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

