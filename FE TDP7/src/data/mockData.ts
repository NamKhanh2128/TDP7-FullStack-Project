// --- INTERFACES ---

export interface HouseholdMember {
  id: string;
  name: string;
  role: 'Chủ hộ' | 'Vợ/Chồng' | 'Con' | 'Cha/Mẹ' | 'Ông/Bà' | 'Cháu' | 'Khác';
  dob: string;
  gender: 'Nam' | 'Nữ';
  idCard: string;
  idIssueDate: string;
  idIssuePlace: string;
  ethnicity: string;
  religion: string;
  occupation: string;
  workplace: string;
  registrationDate: string;
  previousAddress: string;
  avatar?: string;
  isTemporary?: boolean; // Đánh dấu tạm trú
}

export interface Household {
  id: string;
  code: string;
  address: string;
  area: number; // Diện tích (m2) - để tính phí dịch vụ nếu cần
  members: HouseholdMember[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string; // Nội dung chi tiết
  date: string;
  type: 'meeting' | 'health' | 'payment' | 'event' | 'security';
  isImportant?: boolean;
}

export interface BookingSlot {
  id: string;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'maintenance';
  bookedBy?: string;
  fee?: number;
}

export interface Request {
  id: string;
  type: 'tam_vang' | 'tam_tru' | 'dat_lich' | 'bien_dong' | 'khai_sinh' | 'khai_tu';
  applicantName: string;
  householdCode: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string; // Lý do từ chối hoặc ghi chú
  details: Record<string, any>;
}

export interface Asset {
  id: string;
  name: string;
  category: string; // 'Âm thanh' | 'Nội thất' | 'Điện tử' | 'Dụng cụ'
  totalQuantity: number;
  brokenQuantity: number;
  lastMaintenance?: string;
  notes: string;
}

// Mới: Quản lý các khoản đóng góp/phí
export interface FeePayment {
  id: string;
  householdCode: string;
  title: string; // VD: Phí vệ sinh 2024, Quỹ vì người nghèo
  amount: number;
  type: 'mandatory' | 'voluntary'; // Bắt buộc | Tự nguyện
  status: 'paid' | 'unpaid';
  dueDate: string;
  paidAt?: string;
}

// --- DATA ---

// 1. Current User Household (Gia đình mẫu)
export const currentHousehold: Household = {
  id: 'hh-001',
  code: 'TDP7-2024-001',
  address: 'Số 10, Ngõ 5, Đường Lê Trọng Tấn, Phường La Khê, Quận Hà Đông, TP. Hà Nội',
  area: 85,
  members: [
    {
      id: 'm1',
      name: 'Nguyễn Văn An',
      role: 'Chủ hộ',
      dob: '15/03/1975',
      gender: 'Nam',
      idCard: '001075012345',
      idIssueDate: '20/05/2021',
      idIssuePlace: 'Cục CS QLHC về TTXH',
      ethnicity: 'Kinh',
      religion: 'Không',
      occupation: 'Kỹ sư xây dựng',
      workplace: 'Công ty CP Xây dựng Hà Nội',
      registrationDate: '01/01/2010',
      previousAddress: 'Số 5, Phố Huế, Quận Hoàn Kiếm, Hà Nội',
    },
    {
      id: 'm2',
      name: 'Trần Thị Bích',
      role: 'Vợ/Chồng',
      dob: '22/08/1978',
      gender: 'Nữ',
      idCard: '001078054321',
      idIssueDate: '15/06/2021',
      idIssuePlace: 'Cục CS QLHC về TTXH',
      ethnicity: 'Kinh',
      religion: 'Phật giáo',
      occupation: 'Giáo viên',
      workplace: 'Trường THCS La Khê',
      registrationDate: '01/01/2010',
      previousAddress: 'Số 20, Phố Bạch Mai, Quận Hai Bà Trưng, Hà Nội',
    },
    {
      id: 'm3',
      name: 'Nguyễn Minh Tuấn',
      role: 'Con',
      dob: '10/09/2005',
      gender: 'Nam',
      idCard: '001205098765',
      idIssueDate: '12/09/2021',
      idIssuePlace: 'Cục CS QLHC về TTXH',
      ethnicity: 'Kinh',
      religion: 'Không',
      occupation: 'Học sinh',
      workplace: 'Trường THPT Hà Đông',
      registrationDate: '15/09/2005',
      previousAddress: 'Sinh tại địa chỉ thường trú',
    },
    {
      id: 'm4',
      name: 'Nguyễn Thị Mai',
      role: 'Con',
      dob: '25/12/2010',
      gender: 'Nữ',
      idCard: '001210123456',
      idIssueDate: '26/12/2024',
      idIssuePlace: 'Cục CS QLHC về TTXH',
      ethnicity: 'Kinh',
      religion: 'Không',
      occupation: 'Học sinh',
      workplace: 'Trường THCS La Khê',
      registrationDate: '01/01/2011',
      previousAddress: 'Sinh tại địa chỉ thường trú',
    },
  ],
};

// 2. All Households (Danh sách mở rộng cho Admin)
export const allHouseholds: Household[] = [
  currentHousehold,
  {
    id: 'hh-002',
    code: 'TDP7-2024-002',
    address: 'Số 12, Ngõ 5, Đường Lê Trọng Tấn, Phường La Khê',
    area: 100,
    members: [
      {
        id: 'm5',
        name: 'Lê Văn Cường',
        role: 'Chủ hộ',
        dob: '08/11/1980',
        gender: 'Nam',
        idCard: '001080112233',
        idIssueDate: '10/03/2021',
        idIssuePlace: 'Cục CS QLHC về TTXH',
        ethnicity: 'Kinh',
        religion: 'Không',
        occupation: 'Doanh nhân',
        workplace: 'Công ty TNHH Thương mại ABC',
        registrationDate: '15/06/2015',
        previousAddress: 'Số 8, Ngô Quyền, Quận Hoàn Kiếm',
      },
      {
        id: 'm6',
        name: 'Phạm Thị Hương',
        role: 'Vợ/Chồng',
        dob: '14/02/1982',
        gender: 'Nữ',
        idCard: '001082445566',
        idIssueDate: '12/03/2021',
        idIssuePlace: 'Cục CS QLHC về TTXH',
        ethnicity: 'Kinh',
        religion: 'Không',
        occupation: 'Kế toán',
        workplace: 'Công ty TNHH Thương mại ABC',
        registrationDate: '15/06/2015',
        previousAddress: 'Số 15, Trần Phú, Quận Ba Đình',
      },
    ],
  },
  {
    id: 'hh-003',
    code: 'TDP7-2024-003',
    address: 'Số 15, Ngõ 7, Đường Lê Trọng Tấn, Phường La Khê',
    area: 60,
    members: [
      {
        id: 'm7',
        name: 'Hoàng Văn Đức',
        role: 'Chủ hộ',
        dob: '20/05/1968',
        gender: 'Nam',
        idCard: '001068778899',
        idIssueDate: '05/04/2021',
        idIssuePlace: 'Cục CS QLHC về TTXH',
        ethnicity: 'Kinh',
        religion: 'Thiên Chúa',
        occupation: 'Hưu trí',
        workplace: 'Đã nghỉ hưu',
        registrationDate: '01/01/2000',
        previousAddress: 'Số 3, Láng Hạ, Quận Đống Đa',
      },
    ],
  },
  // Hộ mới: Gia đình trẻ thuê nhà (Tạm trú)
  {
    id: 'hh-004',
    code: 'TDP7-2024-004',
    address: 'P402, Chung cư Mini, Ngõ 3, Đường Lê Trọng Tấn',
    area: 45,
    members: [
      {
        id: 'm8',
        name: 'Đặng Tuấn Anh',
        role: 'Chủ hộ',
        dob: '10/10/1995',
        gender: 'Nam',
        idCard: '034095000111',
        idIssueDate: '01/01/2022',
        idIssuePlace: 'Cục CS QLHC về TTXH',
        ethnicity: 'Kinh',
        religion: 'Không',
        occupation: 'IT Developer',
        workplace: 'FPT Software',
        registrationDate: '01/06/2023',
        previousAddress: 'Thái Bình',
        isTemporary: true,
      },
      {
        id: 'm9',
        name: 'Lê Thu Hà',
        role: 'Vợ/Chồng',
        dob: '05/05/1997',
        gender: 'Nữ',
        idCard: '034097000222',
        idIssueDate: '01/01/2022',
        idIssuePlace: 'Cục CS QLHC về TTXH',
        ethnicity: 'Kinh',
        religion: 'Không',
        occupation: 'Marketing',
        workplace: 'Agency XYZ',
        registrationDate: '01/06/2023',
        previousAddress: 'Nam Định',
        isTemporary: true,
      },
    ],
  },
  // Hộ mới: Tam đại đồng đường
  {
    id: 'hh-005',
    code: 'TDP7-2024-005',
    address: 'Số 88, Đường Lê Trọng Tấn',
    area: 120,
    members: [
      { id: 'm10', name: 'Bùi Văn Tính', role: 'Chủ hộ', dob: '1950', gender: 'Nam', ethnicity: 'Kinh', religion: 'Không', occupation: 'Hưu trí', workplace: '', registrationDate: '1990', previousAddress: '', idCard: '001050xxx', idIssueDate: '', idIssuePlace: '' },
      { id: 'm11', name: 'Nguyễn Thị Lành', role: 'Vợ/Chồng', dob: '1952', gender: 'Nữ', ethnicity: 'Kinh', religion: 'Phật giáo', occupation: 'Hưu trí', workplace: '', registrationDate: '1990', previousAddress: '', idCard: '001052xxx', idIssueDate: '', idIssuePlace: '' },
      { id: 'm12', name: 'Bùi Văn Hùng', role: 'Con', dob: '1980', gender: 'Nam', ethnicity: 'Kinh', religion: 'Không', occupation: 'Bác sĩ', workplace: 'BV 103', registrationDate: '1990', previousAddress: '', idCard: '001080xxx', idIssueDate: '', idIssuePlace: '' },
      { id: 'm13', name: 'Phạm Thị Mây', role: 'Con', dob: '1985', gender: 'Nữ', ethnicity: 'Kinh', religion: 'Không', occupation: 'Dược sĩ', workplace: 'Nhà thuốc Mây', registrationDate: '2010', previousAddress: '', idCard: '001085xxx', idIssueDate: '', idIssuePlace: '' },
      { id: 'm14', name: 'Bùi Minh Khôi', role: 'Cháu', dob: '2015', gender: 'Nam', ethnicity: 'Kinh', religion: 'Không', occupation: 'Học sinh', workplace: '', registrationDate: '2015', previousAddress: '', idCard: '', idIssueDate: '', idIssuePlace: '' },
    ]
  }
];

// 3. News Items
export const newsItems: NewsItem[] = [
  {
    id: 'n1',
    title: 'Họp tổ dân phố quý 4/2024',
    summary: 'Thông báo họp tổ dân phố định kỳ vào 19h00 ngày 28/12/2024 tại Nhà văn hóa.',
    content: 'Kính mời đại diện các hộ gia đình tham gia cuộc họp tổng kết cuối năm. Nội dung: Báo cáo tình hình an ninh trật tự, thu chi ngân sách và kế hoạch Tết Nguyên Đán.',
    date: '20/12/2024',
    type: 'meeting',
    isImportant: true,
  },
  {
    id: 'n2',
    title: 'Tiêm chủng vắc-xin cúm mùa',
    summary: 'Trạm y tế phường tổ chức tiêm vắc-xin cúm miễn phí cho người cao tuổi.',
    date: '18/12/2024',
    type: 'health',
  },
  {
    id: 'n3',
    title: 'Thông báo thu tiền điện tháng 12',
    summary: 'Lịch thu tiền điện từ ngày 25-30/12. Vui lòng chuẩn bị trước.',
    date: '15/12/2024',
    type: 'payment',
  },
  {
    id: 'n4',
    title: 'Cảnh báo an ninh dịp Tết',
    summary: 'Đề nghị bà con cảnh giác khóa cửa, phòng chống trộm cắp dịp cuối năm.',
    date: '24/12/2024',
    type: 'security',
    isImportant: true,
  },
];

// 4. Booking Data
export const bookingSlots: BookingSlot[] = [
  { id: 'bs-001', service: 'Hội trường', date: '28/12/2024', startTime: '08:00', endTime: '12:00', status: 'booked', bookedBy: 'Nguyễn Văn An', fee: 500000 },
  { id: 'bs-002', service: 'Sân cầu lông', date: '28/12/2024', startTime: '17:00', endTime: '19:00', status: 'booked', bookedBy: 'Lê Văn Cường', fee: 100000 },
  { id: 'bs-003', service: 'Phòng họp', date: '29/12/2024', startTime: '14:00', endTime: '16:00', status: 'available', fee: 200000 },
  { id: 'bs-004', service: 'Sân cầu lông', date: '29/12/2024', startTime: '06:00', endTime: '08:00', status: 'maintenance' },
];

export const mockBookings = [
  {
    id: 'b-001',
    service: 'hall',
    serviceName: 'Hội trường đám cưới',
    date: '2025-01-15',
    time_start: '08:00',
    time_end: '12:00',
    fee: 500000,
    status: 'approved',
  },
  {
    id: 'b-002',
    service: 'yard',
    serviceName: 'Sân cầu lông',
    date: '2025-02-20',
    time_start: '16:00',
    time_end: '18:00',
    fee: 200000,
    status: 'pending',
  },
  {
    id: 'b-003',
    service: 'hall',
    serviceName: 'Hội trường đám cưới',
    date: '2025-03-05',
    time_start: '14:00',
    time_end: '16:00',
    fee: 500000,
    status: 'rejected',
  },
];

// 5. Pending Requests
export const pendingRequests: Request[] = [
  {
    id: 'req-001',
    type: 'tam_vang',
    applicantName: 'Nguyễn Minh Tuấn',
    householdCode: 'TDP7-2024-001',
    submittedAt: '22/12/2024 09:30',
    status: 'pending',
    details: {
      fromDate: '25/12/2024',
      toDate: '05/01/2025',
      reason: 'Đi học tập trung tại TP.HCM',
      destination: 'Ký túc xá ĐHQG TP.HCM',
    },
  },
  {
    id: 'req-002',
    type: 'tam_tru',
    applicantName: 'Trần Văn Hùng',
    householdCode: 'TDP7-2024-002',
    submittedAt: '21/12/2024 14:15',
    status: 'approved',
    details: {
      guestName: 'Trần Văn Hùng',
      guestDob: '15/06/1995',
      guestGender: 'Nam',
      guestIdCard: '036095123456',
      permanentAddress: 'Xã Đông Hà, Huyện Đông Hưng, Thái Bình',
      duration: '6 tháng',
    },
  },
  {
    id: 'req-003',
    type: 'dat_lich',
    applicantName: 'Lê Văn Cường',
    householdCode: 'TDP7-2024-002',
    submittedAt: '20/12/2024 10:00',
    status: 'pending',
    details: {
      service: 'Hội trường đám cưới',
      date: '15/01/2025',
      startTime: '10:00',
      endTime: '14:00',
      fee: 500000,
    },
  },
  {
    id: 'req-004',
    type: 'khai_sinh',
    applicantName: 'Đặng Tuấn Anh',
    householdCode: 'TDP7-2024-004',
    submittedAt: '24/12/2024 08:00',
    status: 'pending',
    details: {
      childName: 'Đặng Tuấn Kiệt',
      dob: '20/12/2024',
      gender: 'Nam',
      motherName: 'Lê Thu Hà',
      hospital: 'Bệnh viện Phụ sản Hà Nội',
    },
  },
];

// 6. Assets
export const assets: Asset[] = [
  { id: 'a1', name: 'Loa di động JBL', category: 'Âm thanh', totalQuantity: 5, brokenQuantity: 1, notes: '1 loa bị hỏng micro, cần thay pin' },
  { id: 'a2', name: 'Bàn gấp Inox', category: 'Nội thất', totalQuantity: 30, brokenQuantity: 3, notes: '3 bàn gãy chân chốt' },
  { id: 'a3', name: 'Ghế nhựa Song Long', category: 'Nội thất', totalQuantity: 100, brokenQuantity: 5, notes: '5 ghế bị nứt, vỡ' },
  { id: 'a4', name: 'Quạt công nghiệp', category: 'Điện tử', totalQuantity: 8, brokenQuantity: 0, notes: 'Hoạt động tốt, đã tra dầu' },
  { id: 'a5', name: 'Máy chiếu Panasonic', category: 'Điện tử', totalQuantity: 2, brokenQuantity: 0, notes: 'Hoạt động bình thường, bóng đèn còn 80%' },
  { id: 'a6', name: 'Búa, Kìm, Tuốc nơ vít', category: 'Dụng cụ', totalQuantity: 10, brokenQuantity: 2, notes: 'Mất 1 kìm, 1 búa cán lỏng' },
];

// 7. Fees & Contributions
export const feePayments: FeePayment[] = [
  { id: 'fp-01', householdCode: 'TDP7-2024-001', title: 'Phí vệ sinh Q4/2024', amount: 180000, type: 'mandatory', status: 'paid', dueDate: '31/12/2024', paidAt: '20/12/2024' },
  { id: 'fp-02', householdCode: 'TDP7-2024-001', title: 'Quỹ khuyến học 2024', amount: 200000, type: 'voluntary', status: 'paid', dueDate: '31/12/2024', paidAt: '20/12/2024' },
  { id: 'fp-03', householdCode: 'TDP7-2024-001', title: 'Phí an ninh Q4/2024', amount: 100000, type: 'mandatory', status: 'unpaid', dueDate: '31/12/2024' },
  { id: 'fp-04', householdCode: 'TDP7-2024-002', title: 'Phí vệ sinh Q4/2024', amount: 180000, type: 'mandatory', status: 'unpaid', dueDate: '31/12/2024' },
];

// 8. Enhanced Statistics
export const statistics = {
  general: {
    totalHouseholds: 412,
    totalResidents: 1723,
    tempResidents: 45, // Tạm trú
    absentResidents: 12, // Tạm vắng
    pendingRequests: 8,
  },
  ageDistribution: [
    { name: 'Mầm non (0-5)', count: 89, range: '0-5' },
    { name: 'Tiểu học (6-10)', count: 156, range: '6-10' },
    { name: 'THCS (11-14)', count: 142, range: '11-14' },
    { name: 'THPT (15-18)', count: 128, range: '15-18' },
    { name: 'Lao động (19-60)', count: 987, range: '19-60' },
    { name: 'Cao tuổi (60+)', count: 221, range: '60+' },
  ],
  genderDistribution: [
    { name: 'Nam', value: 845 },
    { name: 'Nữ', value: 878 },
  ],
  revenue: {
    total: 150000000,
    byMonth: [
      { name: 'T9', value: 12000000 },
      { name: 'T10', value: 15000000 },
      { name: 'T11', value: 11000000 },
      { name: 'T12', value: 22000000 }, // Cao điểm cuối năm
    ]
  },
  requestTrends: [
    { name: 'Tạm trú', value: 30 },
    { name: 'Tạm vắng', value: 15 },
    { name: 'Khai sinh', value: 5 },
    { name: 'Đặt lịch', value: 45 },
  ]
};

// 9. Services
export const services = [
  { id: 's1', name: 'Hội trường đám cưới', fee: 500000, unit: 'lượt', description: 'Bao gồm âm thanh, ánh sáng cơ bản' },
  { id: 's2', name: 'Sân cầu lông', fee: 100000, unit: 'giờ', description: 'Đặt tối thiểu 1 giờ' },
  { id: 's3', name: 'Phòng họp', fee: 200000, unit: 'buổi', description: 'Sức chứa 20 người, có máy chiếu' },
  { id: 's4', name: 'Loa đài di động', fee: 50000, unit: 'ngày', description: 'Phục vụ việc hiếu hỉ tại gia' },
];