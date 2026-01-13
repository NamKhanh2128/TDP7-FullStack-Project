import axios from 'axios';

// Tạo Axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Thêm token vào header nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) - Token hết hạn hoặc không hợp lệ
    // KHÔNG redirect nếu status là 'pending' (để LoginPage xử lý riêng)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorData = error.response?.data;
      // Chỉ xóa token và redirect nếu KHÔNG phải lỗi pending
      if (errorData?.status !== 'pending') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * API Đăng nhập
 * @param {string} email - Email đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise} Response từ server
 */
export const loginAPI = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // Nếu có error.response.data, trả về nó (bao gồm cả status nếu có)
    if (error.response?.data) {
      // Giữ nguyên status từ backend để frontend có thể xử lý
      const errorData = error.response.data;
      const errorWithStatus = {
        ...errorData,
        status: errorData.status, // Đảm bảo status được giữ lại
      };
      throw errorWithStatus;
    }
    // Nếu không có response, throw error mới
    throw {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Đăng ký
 * @param {Object} data - Dữ liệu đăng ký
 * @param {string} data.full_name - Họ và tên
 * @param {string} data.email - Email
 * @param {string} data.password - Mật khẩu
 * @param {string} data.phone - Số điện thoại
 * @returns {Promise} Response từ server
 */
export const registerAPI = async (data) => {
  try {
    const response = await api.post('/auth/register', {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      phone: data.phone,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Lấy thông tin cá nhân (cần token)
 * @returns {Promise} Response từ server
 */
export const getMeAPI = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Lấy danh sách user chờ duyệt (cần token - Admin only)
 * @returns {Promise} Response từ server
 */
export const getPendingUsersAPI = async () => {
  try {
    const response = await api.get('/users/pending');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Duyệt user (cần token - Admin only)
 * @param {string} userId - ID của user cần duyệt
 * @returns {Promise} Response từ server
 */
export const approveUserAPI = async (userId) => {
  try {
    const response = await api.put(`/users/approve/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Lấy thông tin profile (cần token)
 * @returns {Promise} Response từ server
 */
export const getProfileAPI = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Cập nhật thông tin cá nhân (cần token)
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.full_name - Họ và tên
 * @param {string} data.phone - Số điện thoại
 * @param {string} data.dob - Ngày sinh
 * @param {string} data.gender - Giới tính
 * @param {string} data.cccd - Số CCCD
 * @param {string} data.job - Nghề nghiệp
 * @param {string} data.workplace - Nơi làm việc
 * @returns {Promise} Response từ server
 */
export const updateProfileAPI = async (data) => {
  try {
    const response = await api.put('/users/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Lấy danh sách tất cả hộ khẩu (cần token - Admin only)
 * @returns {Promise} Response từ server
 */
export const getAllHouseholdsAPI = async () => {
  try {
    const response = await api.get('/households');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách hộ khẩu',
    };
  }
};

/**
 * API Lấy chi tiết một hộ khẩu theo ID (cần token - Admin only)
 * @param {string} id - ID của hộ khẩu
 * @returns {Promise} Response từ server
 */
export const getHouseholdByIdAPI = async (id) => {
  try {
    const response = await api.get(`/households/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin hộ khẩu',
    };
  }
};

/**
 * API Tạo hộ khẩu mới (cần token - Admin only)
 * @param {Object} data - Dữ liệu tạo hộ khẩu
 * @param {string} data.household_code - Mã hộ khẩu (hoặc code)
 * @param {string} data.address - Địa chỉ
 * @param {string} data.owner_email - Email chủ hộ (hoặc email_chu_ho)
 * @param {number} data.area - Diện tích (optional)
 * @returns {Promise} Response từ server
 */
export const createHouseholdAPI = async (data) => {
  try {
    // Map tên trường từ Frontend sang Backend
    const payload = {
      code: data.code || data.household_code,  // Backend yêu cầu 'code'
      address: data.address,
      email_chu_ho: data.email_chu_ho || data.owner_email,  // Backend yêu cầu 'email_chu_ho'
      area: data.area !== undefined ? data.area : 0,
    };

    // Validation: Đảm bảo các trường bắt buộc không rỗng
    if (!payload.code || !payload.address || !payload.email_chu_ho) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: code, address, email_chu_ho',
      };
    }

    const response = await api.post('/households', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error || {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Lấy danh sách tất cả nhân khẩu (cần token - Admin only)
 * @returns {Promise} Response từ server
 */
export const getAllResidentsAPI = async () => {
  try {
    const response = await api.get('/residents');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách nhân khẩu',
    };
  }
};

/**
 * API Tạo nhân khẩu mới (cần token - Admin only)
 * @param {Object} data - Dữ liệu tạo nhân khẩu
 * @param {string} data.household_code - Mã hộ khẩu
 * @param {string} data.full_name - Họ và tên
 * @param {string} data.dob - Ngày sinh
 * @param {string} data.gender - Giới tính
 * @param {string} data.relation - Quan hệ với chủ hộ
 * @param {string} data.cccd - Số CCCD/CMND
 * @returns {Promise} Response từ server
 */
export const createResidentAPI = async (data) => {
  try {
    const payload = {
      household_code: data.household_code,
      full_name: data.full_name,
      dob: data.dob,
      gender: data.gender,
      relation: data.relation,
      cccd: data.cccd,
    };

    // Validation: Đảm bảo các trường bắt buộc không rỗng
    if (!payload.household_code || !payload.full_name || !payload.relation) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: household_code, full_name, relation',
      };
    }

    const response = await api.post('/residents', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error || {
      success: false,
      message: error.message || 'Lỗi kết nối đến server',
    };
  }
};

/**
 * API Cập nhật thông tin nhân khẩu (cần token - Admin only)
 * @param {string} id - ID của nhân khẩu
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.name - Họ và tên
 * @param {string} data.dob - Ngày sinh
 * @param {string} data.gender - Giới tính
 * @param {string} data.role - Quan hệ với chủ hộ
 * @param {string} data.idCard - Số CCCD/CMND
 * @param {string} data.occupation - Nghề nghiệp
 * @param {string} data.workplace - Nơi làm việc
 * @returns {Promise} Response từ server
 */
export const updateResidentAPI = async (id, data) => {
  try {
    const response = await api.put(`/residents/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi cập nhật nhân khẩu',
    };
  }
};

/**
 * API Lấy thông tin hộ khẩu của user đang đăng nhập (cần token)
 * @returns {Promise} Response từ server
 */
export const getMyHouseholdAPI = async () => {
  try {
    const response = await api.get('/users/my-household');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin hộ khẩu',
    };
  }
};

/**
 * API Chủ hộ thêm thành viên vào hộ khẩu của mình (cần token - chỉ Chủ hộ)
 * @param {Object} data - Dữ liệu thành viên
 * @param {string} data.full_name - Họ và tên
 * @param {string} data.dob - Ngày sinh
 * @param {string} data.gender - Giới tính
 * @param {string} data.relation - Quan hệ với chủ hộ
 * @param {string} data.cccd - Số CCCD/CMND
 * @param {string} data.job - Nghề nghiệp (optional)
 * @param {string} data.workplace - Nơi làm việc (optional)
 * @returns {Promise} Response từ server
 */
export const addMemberToMyHouseholdAPI = async (data) => {
  try {
    const payload = {
      full_name: data.full_name,
      dob: data.dob,
      gender: data.gender,
      relation: data.relation,
      cccd: data.cccd || '',
      job: data.job || '',
      workplace: data.workplace || '',
    };

    // Validation
    if (!payload.full_name || !payload.relation) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: full_name, relation',
      };
    }

    const response = await api.post('/users/household/members', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error || {
      success: false,
      message: error.message || 'Lỗi khi thêm thành viên',
    };
  }
};

/**
 * API Chủ hộ sửa thông tin thành viên trong hộ khẩu của mình (cần token - chỉ Chủ hộ)
 * @param {string} memberId - ID của thành viên cần sửa
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.full_name - Họ và tên
 * @param {string} data.dob - Ngày sinh
 * @param {string} data.gender - Giới tính
 * @param {string} data.relation - Quan hệ với chủ hộ
 * @param {string} data.cccd - Số CCCD/CMND
 * @param {string} data.job - Nghề nghiệp (optional)
 * @param {string} data.workplace - Nơi làm việc (optional)
 * @returns {Promise} Response từ server
 */
export const updateMemberForUserAPI = async (memberId, data) => {
  try {
    const payload = {
      full_name: data.full_name,
      dob: data.dob,
      gender: data.gender,
      relation: data.relation,
      cccd: data.cccd || '',
      job: data.job || '',
      workplace: data.workplace || '',
    };

    // Validation
    if (!payload.full_name || !payload.relation) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: full_name, relation',
      };
    }

    const response = await api.put(`/users/household/members/${memberId}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error || {
      success: false,
      message: error.message || 'Lỗi khi cập nhật thành viên',
    };
  }
};

/**
 * API Xóa nhân khẩu (cần token - Admin only)
 * @param {string} id - ID của nhân khẩu cần xóa
 * @returns {Promise} Response từ server
 */
export const deleteResidentAPI = async (id) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp ID nhân khẩu',
      };
    }

    const response = await api.delete(`/residents/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi xóa nhân khẩu',
    };
  }
};

/**
 * API Lấy số liệu thống kê cho Dashboard (cần token - Admin only)
 * @returns {Promise} Response từ server
 */
export const getDashboardStatsAPI = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy số liệu thống kê',
    };
  }
};

/**
 * API Lấy danh sách 5 yêu cầu mới nhất (cần token - Admin only)
 * @returns {Promise} Response từ server
 */
export const getRecentRequestsAPI = async () => {
  try {
    const response = await api.get('/requests/recent');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách yêu cầu mới nhất',
    };
  }
};

/**
 * API Lấy danh sách tất cả yêu cầu (cần token - Admin only)
 * @returns {Promise} Response từ server
 */
export const getAllRequestsAPI = async () => {
  try {
    const response = await api.get('/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách yêu cầu',
    };
  }
};

/**
 * API Cập nhật trạng thái yêu cầu (cần token - Admin only)
 * @param {string} id - ID của yêu cầu
 * @param {string} status - Trạng thái mới ('Approved' hoặc 'Rejected')
 * @returns {Promise} Response từ server
 */
export const updateRequestStatusAPI = async (id, status) => {
  try {
    if (!id || !status) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp ID và trạng thái',
      };
    }

    const response = await api.put(`/requests/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi cập nhật trạng thái yêu cầu',
    };
  }
};

/**
 * API Tạo yêu cầu mới (User gửi yêu cầu tạm trú/tạm vắng/đặt lịch)
 * @param {object} data - Dữ liệu yêu cầu { type, reason, start_date, end_date }
 * @returns {Promise} Response từ server
 */
export const createRequestAPI = async (data) => {
  try {
    if (!data || !data.type) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp loại yêu cầu (type)',
      };
    }

    const response = await api.post('/requests', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi gửi yêu cầu',
    };
  }
};

/**
 * API Lấy danh sách yêu cầu của user hiện tại (cần token)
 * @returns {Promise} Response từ server
 */
export const getMyRequestsAPI = async () => {
  try {
    const response = await api.get('/requests/my-requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách yêu cầu',
    };
  }
};

/**
 * API User tự sửa yêu cầu của chính mình (Chỉ cho sửa khi status là Pending)
 * @param {string} id - ID của yêu cầu
 * @param {object} data - Dữ liệu cập nhật { reason, start_date, end_date }
 * @returns {Promise} Response từ server
 */
export const updateMyRequestAPI = async (id, data) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp ID yêu cầu',
      };
    }

    const response = await api.put(`/requests/my-requests/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi cập nhật yêu cầu',
    };
  }
};

/**
 * API Đổi mật khẩu (User tự đổi, không cần Admin duyệt)
 * @param {object} data - Dữ liệu { currentPassword, newPassword }
 * @returns {Promise} Response từ server
 */
export const changePasswordAPI = async (data) => {
  try {
    if (!data || !data.currentPassword || !data.newPassword) {
      throw {
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới',
      };
    }

    const response = await api.put('/auth/change-password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi đổi mật khẩu',
    };
  }
};

/**
 * API Lấy danh sách thông báo
 * @returns {Promise} Response từ server
 */
export const getNotificationsAPI = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách thông báo',
    };
  }
};

/**
 * API Tạo thông báo mới
 * @param {object} data - Dữ liệu { title, type, content, location, event_date, is_urgent }
 * @returns {Promise} Response từ server
 */
export const createNotificationAPI = async (data) => {
  try {
    if (!data || !data.title || !data.content) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: title, content',
      };
    }

    const response = await api.post('/notifications', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi tạo thông báo',
    };
  }
};

/**
 * API Xóa thông báo
 * @param {string} id - ID thông báo
 * @returns {Promise} Response từ server
 */
export const deleteNotificationAPI = async (id) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp id thông báo',
      };
    }

    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi xóa thông báo',
    };
  }
};

/**
 * API Lấy danh sách tài sản (Facilities)
 * @returns {Promise} Response từ server
 */
export const getFacilitiesAPI = async () => {
  try {
    const response = await api.get('/facilities');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách tài sản',
    };
  }
};

/**
 * API Lấy danh sách địa điểm (Locations)
 * @returns {Promise} Response từ server
 */
export const getLocationsAPI = async () => {
  try {
    const response = await api.get('/facilities/locations');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách địa điểm',
    };
  }
};

/**
 * API Lấy danh sách thiết bị (Equipments)
 * @returns {Promise} Response từ server
 */
export const getEquipmentsAPI = async () => {
  try {
    const response = await api.get('/facilities/equipments');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách thiết bị',
    };
  }
};

/**
 * API Tạo tài sản mới
 * @param {object} data - Dữ liệu { name, description, capacity, location, status, maintenance_status }
 * @returns {Promise} Response từ server
 */
export const createFacilityAPI = async (data) => {
  try {
    if (!data || !data.name) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp tên tài sản',
      };
    }

    const response = await api.post('/facilities', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi tạo tài sản',
    };
  }
};

/**
 * API Cập nhật tài sản
 * @param {string} id - ID tài sản
 * @param {object} data - Dữ liệu cập nhật
 * @returns {Promise} Response từ server
 */
export const updateFacilityAPI = async (id, data) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp id tài sản',
      };
    }

    const response = await api.put(`/facilities/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi cập nhật tài sản',
    };
  }
};

/**
 * API Xóa tài sản
 * @param {string} id - ID tài sản
 * @returns {Promise} Response từ server
 */
export const deleteFacilityAPI = async (id) => {
  try {
    if (!id) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp id tài sản',
      };
    }

    const response = await api.delete(`/facilities/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi xóa tài sản',
    };
  }
};

/**
 * API Lấy danh sách đơn đặt lịch (Admin)
 * @returns {Promise} Response từ server
 */
export const getAllBookingsAPI = async () => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách đơn đặt lịch',
    };
  }
};

/**
 * API Cập nhật trạng thái đơn đặt lịch
 * @param {string} id - ID đơn đặt lịch
 * @param {object} data - Dữ liệu { status, admin_note }
 * @returns {Promise} Response từ server
 */
export const updateBookingStatusAPI = async (id, data) => {
  try {
    if (!id || !data || !data.status) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp id và status',
      };
    }

    const response = await api.put(`/bookings/${id}/status`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi cập nhật trạng thái đơn đặt lịch',
    };
  }
};

/**
 * API Tạo đơn đặt lịch (User)
 * @param {object} data - Dữ liệu { facility_id, booking_date, start_time, end_time, purpose, attendees_count }
 * @returns {Promise} Response từ server
 */
export const createBookingAPI = async (data) => {
  try {
    if (!data || !data.facility_id || !data.booking_date || !data.start_time || !data.end_time) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: facility_id, booking_date, start_time, end_time',
        status: 400,
      };
    }

    const response = await api.post('/bookings', data);
    return response.data;
  } catch (error) {
    // Giữ lại status code từ response để frontend có thể xử lý
    const errorData = error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi tạo đơn đặt lịch',
    };
    
    // Thêm status code vào error object
    if (error.response?.status) {
      errorData.status = error.response.status;
    }
    
    throw errorData;
  }
};

/**
 * API Lấy lịch sử đặt lịch của User
 * @returns {Promise} Response từ server
 */
export const getUserBookingsAPI = async () => {
  try {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy lịch sử đặt lịch',
    };
  }
};

/**
 * API Lấy thống kê phản ánh theo trạng thái
 * @returns {Promise} Response từ server { pending, processing, resolved }
 */
export const getFeedbackStatsAPI = async () => {
  try {
    const response = await api.get('/feedbacks/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy thống kê phản ánh',
    };
  }
};

/**
 * API Lấy danh sách phản ánh (Admin)
 * @returns {Promise} Response từ server
 */
export const getAllFeedbacksAPI = async () => {
  try {
    const response = await api.get('/feedbacks');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách phản ánh',
    };
  }
};

/**
 * API Cập nhật trạng thái phản ánh
 * @param {string} id - ID phản ánh
 * @param {object} data - Dữ liệu { status: 'Pending' | 'Processing' | 'Resolved' }
 * @returns {Promise} Response từ server
 */
export const updateFeedbackStatusAPI = async (id, data) => {
  try {
    if (!id || !data || !data.status) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp id và status',
      };
    }

    const response = await api.put(`/feedbacks/${id}/status`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi cập nhật trạng thái phản ánh',
    };
  }
};

/**
 * API User gửi phản ánh/báo cáo
 * @param {object} data - Dữ liệu { title, category, content }
 * @returns {Promise} Response từ server
 */
export const createReportAPI = async (data) => {
  try {
    if (!data || !data.title || !data.category || !data.content) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: title, category, content',
      };
    }

    const response = await api.post('/reports', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi gửi phản ánh',
    };
  }
};

/**
 * API User lấy danh sách phản ánh của chính mình
 * @returns {Promise} Response từ server
 */
export const getMyReportsAPI = async () => {
  try {
    const response = await api.get('/reports/my-reports');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách phản ánh',
    };
  }
};

/**
 * API Admin lấy thống kê số lượng phản ánh theo trạng thái
 * @returns {Promise} Response từ server { pending, processing, resolved }
 */
export const getReportStatsAPI = async () => {
  try {
    const response = await api.get('/reports/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy thống kê phản ánh',
    };
  }
};

/**
 * API Admin lấy danh sách phản ánh (tất cả)
 * @returns {Promise} Response từ server
 */
export const getAllReportsAPI = async () => {
  try {
    const response = await api.get('/reports');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách phản ánh',
    };
  }
};

/**
 * API Admin cập nhật trạng thái phản ánh
 * @param {string|number} id - ID phản ánh
 * @param {object} data - Dữ liệu { status: 'Pending' | 'Processing' | 'Resolved' }
 * @returns {Promise} Response từ server
 */
export const updateReportStatusAPI = async (id, data) => {
  try {
    if (!id || !data || !data.status) {
      throw {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: id và status',
      };
    }

    const response = await api.put(`/reports/${id}/status`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi cập nhật trạng thái phản ánh',
    };
  }
};

/**
 * API Admin lấy thống kê dân số theo độ tuổi
 * @returns {Promise} Response từ server { counts: { children, voters, elderly, total }, lists: { children, voters, elderly } }
 */
export const getDemographicStatsAPI = async () => {
  try {
    const response = await api.get('/reports/demographic-stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      success: false,
      message: error.message || 'Lỗi khi lấy thống kê dân số',
    };
  }
};

export default api;

