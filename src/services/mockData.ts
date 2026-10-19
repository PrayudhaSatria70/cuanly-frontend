import { Category, User, Transaction, BudgetLimit, Mitra, Complaint, NotificationItem, Wallet, DebtItem, WorkspaceMember } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  // 6 Expense Categories (Hick's Law)
  {
    id: 'cat_food',
    slug: 'makanan',
    nameKey: 'cat_food',
    fallbackName: 'Makanan & Minuman',
    icon: 'Utensils',
    color: '#F97316', // Orange
    type: 'EXPENSE',
  },
  {
    id: 'cat_transport',
    slug: 'transportasi',
    nameKey: 'cat_transport',
    fallbackName: 'Transportasi',
    icon: 'Car',
    color: '#0EA5E9', // Sky blue
    type: 'EXPENSE',
  },
  {
    id: 'cat_shopping',
    slug: 'belanja',
    nameKey: 'cat_shopping',
    fallbackName: 'Belanja',
    icon: 'ShoppingBag',
    color: '#8B5CF6', // Purple
    type: 'EXPENSE',
  },
  {
    id: 'cat_entertainment',
    slug: 'hiburan',
    nameKey: 'cat_entertainment',
    fallbackName: 'Hiburan',
    icon: 'Film',
    color: '#EC4899', // Pink
    type: 'EXPENSE',
  },
  {
    id: 'cat_health',
    slug: 'kesehatan',
    nameKey: 'cat_health',
    fallbackName: 'Kesehatan',
    icon: 'HeartPulse',
    color: '#10B981', // Emerald
    type: 'EXPENSE',
  },
  {
    id: 'cat_other',
    slug: 'lainnya',
    nameKey: 'cat_other',
    fallbackName: 'Lainnya',
    icon: 'MoreHorizontal',
    color: '#6B7072', // Dark Slate Gray
    type: 'EXPENSE',
  },
  // Income Categories
  {
    id: 'cat_salary',
    slug: 'gaji',
    nameKey: 'cat_salary',
    fallbackName: 'Gaji Bulanan',
    icon: 'Wallet',
    color: '#059669',
    type: 'INCOME',
  },
  {
    id: 'cat_freelance',
    slug: 'freelance',
    nameKey: 'cat_freelance',
    fallbackName: 'Freelance & Bisnis',
    icon: 'Briefcase',
    color: '#2563EB',
    type: 'INCOME',
  },
  {
    id: 'cat_investment',
    slug: 'investasi',
    nameKey: 'cat_investment',
    fallbackName: 'Investasi & Bunga',
    icon: 'TrendingUp',
    color: '#D97706',
    type: 'INCOME',
  },
];

export const DEMO_USER: User = {
  id: 'usr_demo_01',
  name: 'Budi Santoso',
  username: 'user',
  email: 'user@cuanly.com',
  role: 'USER',
  password: 'user123',
  pin: '123456',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  phone: '0812-3456-7890',
  createdAt: '2026-01-15T00:00:00Z',
};

export const DEMO_ADMIN: User = {
  id: 'usr_admin_01',
  name: 'Siti Rahmawati (Admin)',
  username: 'admin',
  email: 'admin@cuanly.com',
  role: 'ADMIN',
  password: 'admin123',
  pin: '999999',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  phone: '0811-9876-5432',
  createdAt: '2026-01-01T00:00:00Z',
};

export const INITIAL_BUDGETS: BudgetLimit[] = [
  {
    id: 'bgt_food',
    userId: 'usr_demo_01',
    categoryId: 'cat_food',
    categorySlug: 'makanan',
    limitAmount: 2500000,
    period: '2026-10',
  },
  {
    id: 'bgt_transport',
    userId: 'usr_demo_01',
    categoryId: 'cat_transport',
    categorySlug: 'transportasi',
    limitAmount: 1000000,
    period: '2026-10',
  },
  {
    id: 'bgt_shopping',
    userId: 'usr_demo_01',
    categoryId: 'cat_shopping',
    categorySlug: 'belanja',
    limitAmount: 1500000,
    period: '2026-10',
  },
  {
    id: 'bgt_entertainment',
    userId: 'usr_demo_01',
    categoryId: 'cat_entertainment',
    categorySlug: 'hiburan',
    limitAmount: 800000,
    period: '2026-10',
  },
  {
    id: 'bgt_health',
    userId: 'usr_demo_01',
    categoryId: 'cat_health',
    categorySlug: 'kesehatan',
    limitAmount: 500000,
    period: '2026-10',
  },
  {
    id: 'bgt_other',
    userId: 'usr_demo_01',
    categoryId: 'cat_other',
    categorySlug: 'lainnya',
    limitAmount: 400000,
    period: '2026-10',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_01',
    userId: 'usr_demo_01',
    type: 'INCOME',
    amount: 12500000,
    categoryId: 'cat_salary',
    categoryName: 'Gaji Bulanan',
    categorySlug: 'gaji',
    date: '2026-10-01T08:00:00Z',
    notes: 'Gaji pokok bulan Oktober 2026',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'tx_02',
    userId: 'usr_demo_01',
    type: 'EXPENSE',
    amount: 148500,
    categoryId: 'cat_shopping',
    categoryName: 'Belanja',
    categorySlug: 'belanja',
    date: '2026-10-17T14:20:00Z',
    notes: 'Belanja mingguan di Superindo',
    receipt: {
      merchant: 'Superindo Supermarket',
      date: '2026-10-17',
      totalAmount: 148500,
      receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e49016a3505?w=500&auto=format&fit=crop&q=80',
      lineItems: [
        { id: 'item_1', name: 'Beras Premium 5kg', price: 74000, quantity: 1 },
        { id: 'item_2', name: 'Minyak Goreng 2L', price: 38500, quantity: 1 },
        { id: 'item_3', name: 'Telur Ayam 1kg', price: 36000, quantity: 1 },
      ],
      suggestedCategoryId: 'cat_shopping',
      confidenceScore: 98,
    },
    createdAt: '2026-10-17T14:20:00Z',
  },
  {
    id: 'tx_03',
    userId: 'usr_demo_01',
    type: 'EXPENSE',
    amount: 55000,
    categoryId: 'cat_food',
    categoryName: 'Makanan & Minuman',
    categorySlug: 'makanan',
    date: '2026-10-17T12:30:00Z',
    notes: 'Makan siang Nasi Padang & Es Teh',
    createdAt: '2026-10-17T12:30:00Z',
  },
  {
    id: 'tx_04',
    userId: 'usr_demo_01',
    type: 'EXPENSE',
    amount: 42000,
    categoryId: 'cat_transport',
    categoryName: 'Transportasi',
    categorySlug: 'transportasi',
    date: '2026-10-16T18:10:00Z',
    notes: 'Tarif GrabCar ke Stasiun Manggarai',
    createdAt: '2026-10-16T18:10:00Z',
  },
  {
    id: 'tx_05',
    userId: 'usr_demo_01',
    type: 'EXPENSE',
    amount: 250000,
    categoryId: 'cat_entertainment',
    categoryName: 'Hiburan',
    categorySlug: 'hiburan',
    date: '2026-10-15T20:00:00Z',
    notes: 'Nonton Bioskop IMAX & Popcorn bersama teman',
    createdAt: '2026-10-15T20:00:00Z',
  },
  {
    id: 'tx_06',
    userId: 'usr_demo_01',
    type: 'EXPENSE',
    amount: 1400000,
    categoryId: 'cat_shopping',
    categoryName: 'Belanja',
    categorySlug: 'belanja',
    date: '2026-10-12T16:00:00Z',
    notes: 'Sepatu lari baru diskon 10.10',
    createdAt: '2026-10-12T16:00:00Z',
  },
  {
    id: 'tx_07',
    userId: 'usr_demo_01',
    type: 'EXPENSE',
    amount: 2100000,
    categoryId: 'cat_food',
    categoryName: 'Makanan & Minuman',
    categorySlug: 'makanan',
    date: '2026-10-10T19:30:00Z',
    notes: 'Makan keluarga & katering pesta kecil',
    createdAt: '2026-10-10T19:30:00Z',
  },
  {
    id: 'tx_08',
    userId: 'usr_demo_01',
    type: 'INCOME',
    amount: 3500000,
    categoryId: 'cat_freelance',
    categoryName: 'Freelance & Bisnis',
    categorySlug: 'freelance',
    date: '2026-10-08T15:00:00Z',
    notes: 'Pelunasan proyek UI/UX Design website klien',
    createdAt: '2026-10-08T15:00:00Z',
  },
  {
    id: 'tx_09',
    userId: 'usr_demo_01',
    type: 'EXPENSE',
    amount: 550000,
    categoryId: 'cat_transport',
    categoryName: 'Transportasi',
    categorySlug: 'transportasi',
    date: '2026-10-05T09:00:00Z',
    notes: 'Bensin Pertamax bulanan & e-Toll',
    createdAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 'tx_10',
    userId: 'usr_demo_01',
    type: 'EXPENSE',
    amount: 150000,
    categoryId: 'cat_health',
    categoryName: 'Kesehatan',
    categorySlug: 'kesehatan',
    date: '2026-10-03T11:00:00Z',
    notes: 'Beli vitamin C, zinc, dan suplemen harian',
    createdAt: '2026-10-03T11:00:00Z',
  },
];

export const INITIAL_MITRA: Mitra[] = [
  {
    id: 'mitra_01',
    businessName: 'Warung Kopi Kenangan Jaya',
    ownerName: 'Hendro Wijaya',
    email: 'hendro@kopikenangan.id',
    phone: '0813-2233-4455',
    category: 'Kuliner / F&B',
    verificationStatus: 'PENDING',
    submissionDate: '2026-10-16T10:00:00Z',
    documentType: 'NIB & SIUP',
    documentNumber: '9120001234567',
    notes: 'Menunggu review izin edar & rekening perusahaan',
  },
  {
    id: 'mitra_02',
    businessName: 'Apotek Sehat Sentosa',
    ownerName: 'Dr. Maria Ulfa',
    email: 'maria@apoteksehat.com',
    phone: '0812-9988-7766',
    category: 'Kesehatan & Farmasi',
    verificationStatus: 'VERIFIED',
    submissionDate: '2026-10-10T14:30:00Z',
    documentType: 'SIA & SIPA',
    documentNumber: '440/123/DISKES/2026',
    notes: 'Dokumen lengkap dan validasi Kemenkes berhasil',
  },
  {
    id: 'mitra_03',
    businessName: 'Bengkel Cepat Makmur',
    ownerName: 'Agus Subagyo',
    email: 'agus@bengkelmakmur.co.id',
    phone: '0815-4433-2211',
    category: 'Jasa Otomotif',
    verificationStatus: 'REJECTED',
    submissionDate: '2026-10-08T09:15:00Z',
    documentType: 'KTP & NPWP',
    documentNumber: '3201123456780001',
    notes: 'Foto SIUP buram dan alamat KTP tidak sinkron',
  },
  {
    id: 'mitra_04',
    businessName: 'Laundry Bersih Kilat',
    ownerName: 'Dewi Lestari',
    email: 'dewi@bersihkilat.id',
    phone: '0819-7766-5544',
    category: 'Jasa Rumah Tangga',
    verificationStatus: 'PENDING',
    submissionDate: '2026-10-17T11:45:00Z',
    documentType: 'NIB Usaha Mikro',
    documentNumber: '1205009876543',
    notes: 'Permohonan baru masuk kemarin',
  },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp_01',
    ticketId: 'TCK-2026-089',
    userId: 'usr_02',
    userName: 'Rian Pratama',
    userEmail: 'rian@gmail.com',
    title: 'Gagal scan struk nota Indomaret',
    description: 'Foto nota saya tidak terbaca nominal totalnya, sistem OCR menampilkan angka 0.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-17T09:20:00Z',
    updatedAt: '2026-10-17T10:00:00Z',
    resolutionNote: 'Tim teknis sedang meningkatkan toleransi kontras pada OCR scan struk termal.',
  },
  {
    id: 'cmp_02',
    ticketId: 'TCK-2026-088',
    userId: 'usr_03',
    userName: 'Anisa Kusuma',
    userEmail: 'anisa.k@outlook.com',
    title: 'Notifikasi budget lewat batas tidak berdering',
    description: 'Pengeluaran makanan saya sudah 90% tapi belum ada notifikasi pop-up di layar.',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-10-16T15:40:00Z',
    updatedAt: '2026-10-16T15:40:00Z',
  },
  {
    id: 'cmp_03',
    ticketId: 'TCK-2026-085',
    userId: 'usr_04',
    userName: 'Farhan Dwi',
    userEmail: 'farhan.dwi@yahoo.co.id',
    title: 'Permintaan ekspor data format CSV bulanan',
    description: 'Apakah bisa ditambahkan kolom kategori slug pada file CSV yang diekspor?',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: '2026-10-14T11:10:00Z',
    updatedAt: '2026-10-15T16:00:00Z',
    resolutionNote: 'Fitur ekspor CSV sudah diperbarui menyertakan kolom Kategori dan ID Transaksi.',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Peringatan Budget Kategori Makanan',
    titleEn: 'Food Category Budget Warning',
    message: 'Pengeluaran makanan telah mencapai 86% dari batas budget bulanan Anda.',
    messageEn: 'Food spending has reached 86% of your monthly budget limit.',
    type: 'WARNING',
    timestamp: '2026-10-17T12:35:00Z',
    isRead: false,
    link: '/budget/makanan',
  },
  {
    id: 'notif_02',
    title: 'Overbudget Kategori Belanja!',
    titleEn: 'Shopping Category Overbudget!',
    message: 'Perhatian: Pengeluaran belanja telah melewati batas budget (103%).',
    messageEn: 'Warning: Shopping spending has exceeded your budget limit (103%).',
    type: 'ALERT',
    timestamp: '2026-10-17T14:25:00Z',
    isRead: false,
    link: '/budget/belanja',
  },
  {
    id: 'notif_03',
    title: 'Pencatatan Berhasil',
    titleEn: 'Recorded Successfully',
    message: 'Struk Superindo Rp 148.500 telah berhasil disimpan.',
    messageEn: 'Superindo receipt of Rp 148,500 has been successfully recorded.',
    type: 'SUCCESS',
    timestamp: '2026-10-17T14:20:00Z',
    isRead: true,
    link: '/transaksi',
  },
];

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'wlt_cash',
    userId: 'usr_demo_01',
    name: 'Dompet Tunai (Cash)',
    type: 'CASH',
    balance: 850000,
    color: '#10B981',
    isShared: false,
  },
  {
    id: 'wlt_bca',
    userId: 'usr_demo_01',
    name: 'Rekening Bank BCA',
    type: 'BANK',
    accountNumber: '8820-192-381',
    balance: 5850000,
    color: '#2563EB',
    isShared: false,
  },
  {
    id: 'wlt_gopay',
    userId: 'usr_demo_01',
    name: 'GoPay & OVO Digital',
    type: 'E_WALLET',
    accountNumber: '0812-3456-7890',
    balance: 420000,
    color: '#06B6D4',
    isShared: false,
  },
  {
    id: 'wlt_shared_team',
    userId: 'usr_demo_01',
    name: 'Kas Operasional Usaha (Shared)',
    type: 'BANK',
    accountNumber: '7190-281-990',
    balance: 14500000,
    color: '#8B5CF6',
    isShared: true,
  },
];

export const INITIAL_DEBTS: DebtItem[] = [
  {
    id: 'debt_01',
    userId: 'usr_demo_01',
    type: 'RECEIVABLE', // Orang berhutang ke saya
    personName: 'Rian Pratama',
    amount: 350000,
    dueDate: '2026-10-25',
    notes: 'Pinjaman patungan tiket konser',
    isSettled: false,
    createdAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'debt_02',
    userId: 'usr_demo_01',
    type: 'DEBT', // Saya berhutang ke orang
    personName: 'Dewi Lestari',
    amount: 150000,
    dueDate: '2026-10-22',
    notes: 'Talangan makan malam reuni',
    isSettled: false,
    createdAt: '2026-10-12T19:30:00Z',
  },
  {
    id: 'debt_03',
    userId: 'usr_demo_01',
    type: 'RECEIVABLE',
    personName: 'Andi Wijaya (Klien)',
    amount: 1200000,
    dueDate: '2026-10-30',
    notes: 'Pelunasan sisa jasa desain logo',
    isSettled: false,
    createdAt: '2026-10-05T08:00:00Z',
  },
];

export const INITIAL_WORKSPACE_MEMBERS: WorkspaceMember[] = [
  {
    id: 'mem_01',
    name: 'Budi Santoso (Anda)',
    email: 'user@cuanly.com',
    role: 'OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'mem_02',
    name: 'Siti Admin',
    email: 'admin@cuanly.com',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'mem_03',
    name: 'Finance Partner',
    email: 'keuangan@tokocuan.com',
    role: 'MEMBER',
    status: 'ACTIVE',
  },
];



// ============================================================================
// LIVE ADMIN FINANCIAL ECOSYSTEM (Matching Database Seeds)
// User ID: usr_live_admin / usr_admin_01 (admin@cuanly.com)
// ============================================================================

export const ADMIN_INITIAL_WALLETS: Wallet[] = [
  {
    "id": "wal_admin_cash",
    "userId": "usr_live_admin",
    "name": "Dompet Tunai Kas Kecil",
    "type": "CASH",
    "balance": 3850000,
    "color": "#10B981",
    "isShared": false
  },
  {
    "id": "wal_admin_bca",
    "userId": "usr_live_admin",
    "name": "BCA Prioritas Bisnis",
    "type": "BANK",
    "accountNumber": "8820192831",
    "balance": 54200000,
    "color": "#0284C7",
    "isShared": false
  },
  {
    "id": "wal_admin_mandiri",
    "userId": "usr_live_admin",
    "name": "Mandiri Giro Operasional",
    "type": "BANK",
    "accountNumber": "1370018291028",
    "balance": 28650000,
    "color": "#2563EB",
    "isShared": false
  },
  {
    "id": "wal_admin_gopay",
    "userId": "usr_live_admin",
    "name": "GoPay Merchant & OVO Bisnis",
    "type": "E_WALLET",
    "accountNumber": "0811-9876-5432",
    "balance": 4750000,
    "color": "#06B6D4",
    "isShared": false
  },
  {
    "id": "wal_admin_shared",
    "userId": "usr_live_admin",
    "name": "Shared Treasury Workspace Tim",
    "type": "BANK",
    "accountNumber": "7190281990",
    "balance": 95000000,
    "color": "#8B5CF6",
    "isShared": true,
    "sharedRole": "OWNER"
  }
];

export const ADMIN_INITIAL_BUDGETS: BudgetLimit[] = [
  {
    "id": "bud_admin_food",
    "userId": "usr_live_admin",
    "categoryId": "cat_food",
    "categorySlug": "makanan",
    "limitAmount": 4500000,
    "period": "2026-10"
  },
  {
    "id": "bud_admin_transport",
    "userId": "usr_live_admin",
    "categoryId": "cat_transport",
    "categorySlug": "transportasi",
    "limitAmount": 2500000,
    "period": "2026-10"
  },
  {
    "id": "bud_admin_shopping",
    "userId": "usr_live_admin",
    "categoryId": "cat_shopping",
    "categorySlug": "belanja",
    "limitAmount": 6000000,
    "period": "2026-10"
  },
  {
    "id": "bud_admin_entertainment",
    "userId": "usr_live_admin",
    "categoryId": "cat_entertainment",
    "categorySlug": "hiburan",
    "limitAmount": 3000000,
    "period": "2026-10"
  },
  {
    "id": "bud_admin_health",
    "userId": "usr_live_admin",
    "categoryId": "cat_health",
    "categorySlug": "kesehatan",
    "limitAmount": 2000000,
    "period": "2026-10"
  },
  {
    "id": "bud_admin_other",
    "userId": "usr_live_admin",
    "categoryId": "cat_other",
    "categorySlug": "lainnya",
    "limitAmount": 1500000,
    "period": "2026-10"
  }
];

export const ADMIN_INITIAL_TRANSACTIONS: Transaction[] = [
  {
    "id": "tx_admin_01",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_salary",
    "categoryName": "Gaji Bulanan",
    "categorySlug": "gaji",
    "type": "INCOME",
    "amount": 35000000,
    "date": "2026-10-01T08:00:00Z",
    "notes": "Gaji Eksekutif & Tunjangan Direksi Cuanly Oktober 2026",
    "createdAt": "2026-10-01T08:00:00Z"
  },
  {
    "id": "tx_admin_02",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_mandiri",
    "categoryId": "cat_freelance",
    "categoryName": "Freelance & Bisnis",
    "categorySlug": "freelance",
    "type": "INCOME",
    "amount": 24500000,
    "date": "2026-10-04T10:30:00Z",
    "notes": "Retainer Konsultasi Arsitektur FinTech PT Nusantara",
    "createdAt": "2026-10-04T10:30:00Z"
  },
  {
    "id": "tx_admin_03",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_investment",
    "categoryName": "Investasi & Bunga",
    "categorySlug": "investasi",
    "type": "INCOME",
    "amount": 4850000,
    "date": "2026-10-06T14:15:00Z",
    "notes": "Dividen Saham BBCA Q3 2026 (60 Lot)",
    "createdAt": "2026-10-06T14:15:00Z"
  },
  {
    "id": "tx_admin_04",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_shared",
    "categoryId": "cat_freelance",
    "categoryName": "Freelance & Bisnis",
    "categorySlug": "freelance",
    "type": "INCOME",
    "amount": 18000000,
    "date": "2026-10-08T11:00:00Z",
    "notes": "Pembayaran Lisensi Paket B2B 5 Client Baru",
    "createdAt": "2026-10-08T11:00:00Z"
  },
  {
    "id": "tx_admin_05",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_investment",
    "categoryName": "Investasi & Bunga",
    "categorySlug": "investasi",
    "type": "INCOME",
    "amount": 1250000,
    "date": "2026-10-12T09:00:00Z",
    "notes": "Yield Bulanan Reksadana Sucorinvest Stable Fund",
    "createdAt": "2026-10-12T09:00:00Z"
  },
  {
    "id": "tx_admin_06",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_shopping",
    "categoryName": "Belanja",
    "categorySlug": "belanja",
    "type": "EXPENSE",
    "amount": 28500000,
    "date": "2026-10-03T13:45:00Z",
    "notes": "Pengadaan Laptop Apple MacBook Pro M3 untuk Tech Lead",
    "receipt": {
      "merchant": "iBox Grand Indonesia",
      "date": "2026-10-03",
      "totalAmount": 28500000,
      "receiptImageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80",
      "lineItems": [
        {
          "id": "item_ibox_1",
          "name": "MacBook Pro 14\" M3 Pro 18GB/512GB",
          "price": 28500000,
          "quantity": 1
        }
      ],
      "confidenceScore": 99,
      "suggestedCategoryId": "cat_shopping"
    },
    "createdAt": "2026-10-03T13:45:00Z"
  },
  {
    "id": "tx_admin_07",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_mandiri",
    "categoryId": "cat_other",
    "categoryName": "Lainnya",
    "categorySlug": "lainnya",
    "type": "EXPENSE",
    "amount": 4500000,
    "date": "2026-10-02T10:00:00Z",
    "notes": "Sewa Private Office Coworking BSD City Oktober 2026",
    "createdAt": "2026-10-02T10:00:00Z"
  },
  {
    "id": "tx_admin_08",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_other",
    "categoryName": "Lainnya",
    "categorySlug": "lainnya",
    "type": "EXPENSE",
    "amount": 2450000,
    "date": "2026-10-05T02:00:00Z",
    "notes": "Billing AWS Cloud & Neon PostgreSQL Serverless Cluster",
    "createdAt": "2026-10-05T02:00:00Z"
  },
  {
    "id": "tx_admin_09",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_cash",
    "categoryId": "cat_food",
    "categoryName": "Makanan & Minuman",
    "categorySlug": "makanan",
    "type": "EXPENSE",
    "amount": 1250000,
    "date": "2026-10-07T13:00:00Z",
    "notes": "Lunch Meeting dengan Potential Venture Partner di Osteria Gia",
    "receipt": {
      "merchant": "Osteria Gia Plaza Indonesia",
      "date": "2026-10-07",
      "totalAmount": 1250000,
      "receiptImageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
      "lineItems": [
        {
          "id": "item_osteria_1",
          "name": "Truffle Carbonara & Ribeye Steak",
          "price": 950000,
          "quantity": 1
        },
        {
          "id": "item_osteria_2",
          "name": "San Pellegrino & Dessert Panna Cotta",
          "price": 300000,
          "quantity": 1
        }
      ],
      "confidenceScore": 98,
      "suggestedCategoryId": "cat_food"
    },
    "createdAt": "2026-10-07T13:00:00Z"
  },
  {
    "id": "tx_admin_10",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_gopay",
    "categoryId": "cat_food",
    "categoryName": "Makanan & Minuman",
    "categorySlug": "makanan",
    "type": "EXPENSE",
    "amount": 680000,
    "date": "2026-10-09T18:30:00Z",
    "notes": "Makan malam tim sprint review di Sushi Tei",
    "createdAt": "2026-10-09T18:30:00Z"
  },
  {
    "id": "tx_admin_11",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_transport",
    "categoryName": "Transportasi",
    "categorySlug": "transportasi",
    "type": "EXPENSE",
    "amount": 600000,
    "date": "2026-10-10T07:15:00Z",
    "notes": "Tiket Kereta Cepat Whoosh Executive PP Jakarta-Bandung (Kunjungan Klien)",
    "createdAt": "2026-10-10T07:15:00Z"
  },
  {
    "id": "tx_admin_12",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_cash",
    "categoryId": "cat_transport",
    "categoryName": "Transportasi",
    "categorySlug": "transportasi",
    "type": "EXPENSE",
    "amount": 850000,
    "date": "2026-10-11T16:00:00Z",
    "notes": "Bensin Shell V-Power & Saldo e-Toll Operasional",
    "createdAt": "2026-10-11T16:00:00Z"
  },
  {
    "id": "tx_admin_13",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_mandiri",
    "categoryId": "cat_health",
    "categoryName": "Kesehatan",
    "categorySlug": "kesehatan",
    "type": "EXPENSE",
    "amount": 1750000,
    "date": "2026-10-13T10:00:00Z",
    "notes": "Medical Check-up & Vitamin C Booster Tim",
    "createdAt": "2026-10-13T10:00:00Z"
  },
  {
    "id": "tx_admin_14",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_shopping",
    "categoryName": "Belanja",
    "categorySlug": "belanja",
    "type": "EXPENSE",
    "amount": 1950000,
    "date": "2026-10-14T15:20:00Z",
    "notes": "Monitor Dell UltraSharp 27\" 4K untuk Dashboard Monitoring",
    "createdAt": "2026-10-14T15:20:00Z"
  },
  {
    "id": "tx_admin_15",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_gopay",
    "categoryId": "cat_entertainment",
    "categoryName": "Hiburan",
    "categorySlug": "hiburan",
    "type": "EXPENSE",
    "amount": 1450000,
    "date": "2026-10-15T19:00:00Z",
    "notes": "Team Bonding Bowling & Dinner di Spincity BSD",
    "createdAt": "2026-10-15T19:00:00Z"
  },
  {
    "id": "tx_admin_16",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_cash",
    "categoryId": "cat_food",
    "categoryName": "Makanan & Minuman",
    "categorySlug": "makanan",
    "type": "EXPENSE",
    "amount": 420000,
    "date": "2026-10-16T11:30:00Z",
    "notes": "Stok Kopi Specialty Beans & Susu Oat Pantry Kantor",
    "createdAt": "2026-10-16T11:30:00Z"
  },
  {
    "id": "tx_admin_17",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_other",
    "categoryName": "Lainnya",
    "categorySlug": "lainnya",
    "type": "EXPENSE",
    "amount": 1200000,
    "date": "2026-10-17T08:30:00Z",
    "notes": "Langganan ChatGPT Team & GitHub Enterprise Suite",
    "createdAt": "2026-10-17T08:30:00Z"
  },
  {
    "id": "tx_admin_18",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_mandiri",
    "categoryId": "cat_transport",
    "categoryName": "Transportasi",
    "categorySlug": "transportasi",
    "type": "EXPENSE",
    "amount": 280000,
    "date": "2026-10-17T17:15:00Z",
    "notes": "Bluebird Silver Bird Bandara ke Headquarter",
    "createdAt": "2026-10-17T17:15:00Z"
  },
  {
    "id": "tx_admin_19",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_cash",
    "categoryId": "cat_shopping",
    "categoryName": "Belanja",
    "categorySlug": "belanja",
    "type": "EXPENSE",
    "amount": 580000,
    "date": "2026-10-18T14:00:00Z",
    "notes": "Perlengkapan Kebersihan & ATK Superindo",
    "receipt": {
      "merchant": "Superindo Supermarket",
      "date": "2026-10-18",
      "totalAmount": 580000,
      "receiptImageUrl": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80",
      "lineItems": [
        {
          "id": "item_sup_1",
          "name": "Paper Towel & Hand Sanitizer",
          "price": 240000,
          "quantity": 2
        },
        {
          "id": "item_sup_2",
          "name": "Coffee Refill & Mineral Water Galon",
          "price": 340000,
          "quantity": 1
        }
      ],
      "confidenceScore": 97,
      "suggestedCategoryId": "cat_shopping"
    },
    "createdAt": "2026-10-18T14:00:00Z"
  },
  {
    "id": "tx_admin_20",
    "userId": "usr_live_admin",
    "walletId": "wal_admin_bca",
    "categoryId": "cat_food",
    "categoryName": "Makanan & Minuman",
    "categorySlug": "makanan",
    "type": "EXPENSE",
    "amount": 350000,
    "date": "2026-10-19T12:00:00Z",
    "notes": "Makan Siang Soto Betawi & Jus Alpukat bersama tim developer",
    "createdAt": "2026-10-19T12:00:00Z"
  }
];

export const ADMIN_INITIAL_DEBTS: DebtItem[] = [
  {
    "id": "debt_admin_01",
    "userId": "usr_live_admin",
    "type": "RECEIVABLE",
    "personName": "PT Sinar Digital Abadi (Client Enterprise)",
    "amount": 18000000,
    "dueDate": "2026-11-20",
    "notes": "Piutang Termin 2 Jasa Pengembangan Backend & PostgreSQL Optimization",
    "isSettled": false,
    "tenorMonths": 3,
    "interestRate": 0,
    "installmentAmount": 6000000,
    "paidAmount": 6000000,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "debt_admin_02",
    "userId": "usr_live_admin",
    "type": "RECEIVABLE",
    "personName": "Hendro Wijaya (Owner Kopi Kenangan Jaya)",
    "amount": 5500000,
    "dueDate": "2026-10-31",
    "notes": "Talangan Bridging Mesin POS Kasir & Tablet Kasir Cabang 2",
    "isSettled": false,
    "tenorMonths": 2,
    "interestRate": 0,
    "installmentAmount": 2750000,
    "paidAmount": 2750000,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "debt_admin_03",
    "userId": "usr_live_admin",
    "type": "RECEIVABLE",
    "personName": "Dr. Maria Ulfa (Apotek Sehat Sentosa)",
    "amount": 7800000,
    "dueDate": "2026-11-15",
    "notes": "Invoice Layanan Custom Budgeting & Auto-Sync Transaksi Farmasi",
    "isSettled": false,
    "tenorMonths": 1,
    "interestRate": 0,
    "installmentAmount": 7800000,
    "paidAmount": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "debt_admin_04",
    "userId": "usr_live_admin",
    "type": "DEBT",
    "personName": "Vendor IT Distributor Jaya Sentosa",
    "amount": 12000000,
    "dueDate": "2026-12-10",
    "notes": "Cicilan Pengadaan Server Rack Backup & UPS Kantor",
    "isSettled": false,
    "tenorMonths": 6,
    "interestRate": 5,
    "installmentAmount": 2100000,
    "paidAmount": 4200000,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "debt_admin_05",
    "userId": "usr_live_admin",
    "type": "DEBT",
    "personName": "Bank Mandiri (Kredit Modal Kerja Bisnis)",
    "amount": 25000000,
    "dueDate": "2026-11-25",
    "notes": "Fasilitas Modal Kerja Operasional B2B Multi-Tenant Platform",
    "isSettled": false,
    "tenorMonths": 12,
    "interestRate": 6,
    "installmentAmount": 2208333,
    "paidAmount": 11041665,
    "createdAt": "2026-10-01T00:00:00Z"
  },
  {
    "id": "debt_admin_06",
    "userId": "usr_live_admin",
    "type": "DEBT",
    "personName": "Kantor Pajak Pratama (PPh Final UMKM PP 23)",
    "amount": 1450000,
    "dueDate": "2026-10-25",
    "notes": "Kewajiban Setoran PPh Final Masa Pajak September 2026",
    "isSettled": false,
    "tenorMonths": 1,
    "interestRate": 0,
    "installmentAmount": 1450000,
    "paidAmount": 0,
    "createdAt": "2026-10-01T00:00:00Z"
  }
];

export const ADMIN_INITIAL_WORKSPACE_MEMBERS: WorkspaceMember[] = [
  {
    "id": "mem_admin_01",
    "name": "Administrator Cuanly (Anda)",
    "email": "admin@cuanly.com",
    "role": "OWNER",
    "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "status": "ACTIVE"
  },
  {
    "id": "mem_admin_02",
    "name": "Siti Rahmawati, S.E. (Head of Finance)",
    "email": "siti.rahma@cuanly.com",
    "role": "ADMIN",
    "avatarUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "status": "ACTIVE"
  },
  {
    "id": "mem_admin_03",
    "name": "Dimas Arya Prasetya (VP Business Dev)",
    "email": "dimas.arya@cuanly.com",
    "role": "ADMIN",
    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "status": "ACTIVE"
  },
  {
    "id": "mem_admin_04",
    "name": "Nadia Safitri (Treasury Specialist)",
    "email": "nadia.safitri@cuanly.com",
    "role": "MEMBER",
    "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "status": "ACTIVE"
  },
  {
    "id": "mem_admin_05",
    "name": "Kevin Sanjaya, CPA (External Auditor)",
    "email": "kevin.sanjaya@mitracuan.id",
    "role": "MEMBER",
    "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "status": "INVITED"
  }
];

export const ADMIN_INITIAL_INVESTMENTS = [
  {
    "id": "ast_admin_01",
    "userId": "usr_live_admin",
    "name": "PT Bank Central Asia Tbk (BBCA)",
    "category": "SAHAM",
    "quantity": 6000,
    "buyPrice": 8850,
    "currentPrice": 10350,
    "notes": "60 Lot Saham Bluechip Dividen Konsisten"
  },
  {
    "id": "ast_admin_02",
    "userId": "usr_live_admin",
    "name": "Sucorinvest Stable Fund",
    "category": "REKSADANA",
    "quantity": 18500,
    "buyPrice": 2150,
    "currentPrice": 2410,
    "notes": "Reksadana Pendapatan Tetap Alokasi Kas Siaga"
  },
  {
    "id": "ast_admin_03",
    "userId": "usr_live_admin",
    "name": "Logam Mulia Emas Antam CertiCard",
    "category": "EMAS",
    "quantity": 50,
    "buyPrice": 1180000,
    "currentPrice": 1490000,
    "notes": "50 Gram Emas Batangan Fisik Brankas Kantor"
  },
  {
    "id": "ast_admin_04",
    "userId": "usr_live_admin",
    "name": "Bitcoin (BTC) Reserve",
    "category": "CRYPTO",
    "quantity": 0.25,
    "buyPrice": 820000000,
    "currentPrice": 1080000000,
    "notes": "Cadangan Aset Kripto Cold Hardware Wallet"
  },
  {
    "id": "ast_admin_05",
    "userId": "usr_live_admin",
    "name": "Ruko Komersial 2 Lantai BSD Sinarmas",
    "category": "PROPERTI",
    "quantity": 1,
    "buyPrice": 1350000000,
    "currentPrice": 1580000000,
    "notes": "Aset Properti Komersial Disewakan"
  }
];

export const ADMIN_INITIAL_BANK_CONNECTIONS = [
  {
    "id": "bnk_admin_01",
    "userId": "usr_live_admin",
    "institution": "BCA",
    "accountNumber": "8820192831",
    "accountName": "PT Cuanly Inovasi Digital",
    "syncStatus": "CONNECTED",
    "autoSync": true
  },
  {
    "id": "bnk_admin_02",
    "userId": "usr_live_admin",
    "institution": "MANDIRI",
    "accountNumber": "1370018291028",
    "accountName": "PT Cuanly Inovasi Digital",
    "syncStatus": "CONNECTED",
    "autoSync": true
  },
  {
    "id": "bnk_admin_03",
    "userId": "usr_live_admin",
    "institution": "BRI",
    "accountNumber": "020601002918302",
    "accountName": "PT Cuanly Inovasi Digital",
    "syncStatus": "CONNECTED",
    "autoSync": true
  },
  {
    "id": "bnk_admin_04",
    "userId": "usr_live_admin",
    "institution": "GOPAY",
    "accountNumber": "0811-9876-5432",
    "accountName": "Cuanly Official Store",
    "syncStatus": "CONNECTED",
    "autoSync": true
  }
];

export const ADMIN_INITIAL_BUSINESS_PROFILE = {
  "id": "biz_admin_01",
  "userId": "usr_live_admin",
  "businessName": "PT Cuanly Inovasi Finansial",
  "npwp": "01.234.567.8-012.000",
  "period": "2026",
  "annualRevenue": 580000000,
  "operatingExpense": 215000000,
  "cashRunwayMonths": 22.4,
  "taxRate": 0.005
};
