export type Language = 'en' | 'sw';

export interface Translations {
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  export: string;
  import: string;
  confirm: string;
  yes: string;
  no: string;
  close: string;
  back: string;
  next: string;
  previous: string;
  submit: string;
  skip: string;
  done: string;
  refresh: string;
  view: string;
  actions: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  amount: string;
  date: string;
  time: string;
  total: string;
  pending: string;
  completed: string;
  failed: string;
  
  // Auth
  login: string;
  logout: string;
  signIn: string;
  signUp: string;
  signOut: string;
  forgotPassword: string;
  resetPassword: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  rememberMe: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  createAccount: string;
  verifyEmail: string;
  emailSent: string;
  checkInbox: string;
  resendEmail: string;
  invalidCredentials: string;
  emailRequired: string;
  passwordRequired: string;
  passwordMinLength: string;
  passwordsDoNotMatch: string;
  loginSuccess: string;
  signupSuccess: string;
  logoutSuccess: string;
  
  // Navigation
  dashboard: string;
  members: string;
  contributions: string;
  loans: string;
  meetings: string;
  analytics: string;
  settings: string;
  pricing: string;
  adminPanel: string;
  tools: string;
  reports: string;
  systemSettings: string;
  
  // Dashboard
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  totalFund: string;
  activeMembers: string;
  loansOutstanding: string;
  interestEarned: string;
  upcomingMeeting: string;
  topContributors: string;
  recentActivity: string;
  overdueLoans: string;
  fundGrowth: string;
  contributionProgress: string;
  
  // Members
  addMember: string;
  editMember: string;
  deleteMember: string;
  memberDetails: string;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  memberRole: string;
  joinDate: string;
  totalContributed: string;
  totalLoans: string;
  shares: string;
  active: string;
  inactive: string;
  chairman: string;
  treasurer: string;
  secretary: string;
  member: string;
  searchMembers: string;
  noMembersFound: string;
  
  // Contributions
  addContribution: string;
  recordPayment: string;
  mpesaReconciliation: string;
  contributionHistory: string;
  monthlyContributionAmt: string;
  paid: string;
  overdue: string;
  mpesaRef: string;
  selectMonth: string;
  allStatuses: string;
  
  // Loans
  applyLoan: string;
  approveLoan: string;
  rejectLoan: string;
  loanAmount: string;
  loanPurpose: string;
  loanInterest: string;
  loanBalance: string;
  disbursedDate: string;
  dueDate: string;
  repayment: string;
  activeLoans: string;
  loanHistory: string;
  noActiveLoans: string;
  
  // Meetings
  scheduleMeeting: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTime: string;
  meetingVenue: string;
  meetingAgenda: string;
  meetingMinutes: string;
  attendees: string;
  upcoming: string;
  cancelled: string;
  sendReminder: string;
  viewAgenda: string;
  
  // Settings
  chamaInfo: string;
  chamaName: string;
  registrationNumber: string;
  location: string;
  founded: string;
  meetingSchedule: string;
  monthlyContributionAmount: string;
  loanInterestRate: string;
  notifications: string;
  mpesaSettings: string;
  security: string;
  saveChanges: string;
  settingsSaved: string;
  
  // Admin
  adminDashboard: string;
  totalChamas: string;
  totalUsers: string;
  revenue: string;
  systemHealth: string;
  recentLogs: string;
  userManagement: string;
  allUsers: string;
  addUser: string;
  editUser: string;
  userRole: string;
  userStatus: string;
  lastLogin: string;
  systemLogs: string;
  logLevel: string;
  logAction: string;
  logDetails: string;
  exportLogs: string;
  clearLogs: string;
  databaseBackup: string;
  cacheClear: string;
  systemUpdate: string;
  
  // Errors
  somethingWentWrong: string;
  tryAgain: string;
  networkError: string;
  unauthorized: string;
  forbidden: string;
  notFound: string;
  serverError: string;
  
  // Sound/Alerts
  newMessage: string;
  paymentReceived: string;
  loanApproved: string;
  meetingReminder: string;
  contributionReminder: string;
  warning: string;
  info: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    skip: 'Skip',
    done: 'Done',
    refresh: 'Refresh',
    view: 'View',
    actions: 'Actions',
    status: 'Status',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    amount: 'Amount',
    date: 'Date',
    time: 'Time',
    total: 'Total',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    
    // Auth
    login: 'Login',
    logout: 'Logout',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'Enter password',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember me',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    verifyEmail: 'Verify Email',
    emailSent: 'Verification email sent!',
    checkInbox: 'Check your inbox',
    resendEmail: 'Resend Email',
    invalidCredentials: 'Invalid credentials',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    loginSuccess: 'Login successful!',
    signupSuccess: 'Account created! Check your email to verify.',
    logoutSuccess: 'Logged out successfully',
    
    // Navigation
    dashboard: 'Dashboard',
    members: 'Members',
    contributions: 'Contributions',
    loans: 'Loans',
    meetings: 'Meetings',
    analytics: 'Analytics',
    settings: 'Settings',
    pricing: 'Upgrade',
    adminPanel: 'Admin Panel',
    tools: 'Tools & Logs',
    reports: 'Analytics',
    systemSettings: 'System Settings',
    
    // Dashboard
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    totalFund: 'Total Fund',
    activeMembers: 'Active Members',
    loansOutstanding: 'Loans Outstanding',
    interestEarned: 'Interest Earned',
    upcomingMeeting: 'Upcoming Meeting',
    topContributors: 'Top Contributors',
    recentActivity: 'Recent Activity',
    overdueLoans: 'Overdue Loans',
    fundGrowth: 'Fund Growth Trend',
    contributionProgress: 'Contribution Progress',
    
    // Members
    addMember: 'Add Member',
    editMember: 'Edit Member',
    deleteMember: 'Delete Member',
    memberDetails: 'Member Details',
    memberName: 'Full Name',
    memberPhone: 'Phone Number',
    memberEmail: 'Email Address',
    memberRole: 'Role',
    joinDate: 'Join Date',
    totalContributed: 'Total Contributed',
    totalLoans: 'Total Loans',
    shares: 'Shares',
    active: 'Active',
    inactive: 'Inactive',
    chairman: 'Chairman',
    treasurer: 'Treasurer',
    secretary: 'Secretary',
    member: 'Member',
    searchMembers: 'Search members...',
    noMembersFound: 'No members found',
    
    // Contributions
    addContribution: 'Add Contribution',
    recordPayment: 'Record Payment',
    mpesaReconciliation: 'M-Pesa Reconciliation',
    contributionHistory: 'Contribution History',
    monthlyContributionAmt: 'Monthly Contribution',
    paid: 'Paid',
    overdue: 'Overdue',
    mpesaRef: 'M-Pesa Reference',
    selectMonth: 'Select Month',
    allStatuses: 'All Statuses',
    
    // Loans
    applyLoan: 'Apply for Loan',
    approveLoan: 'Approve Loan',
    rejectLoan: 'Reject Loan',
    loanAmount: 'Loan Amount',
    loanPurpose: 'Purpose',
    loanInterest: 'Interest Rate',
    loanBalance: 'Balance',
    disbursedDate: 'Disbursed Date',
    dueDate: 'Due Date',
    repayment: 'Repayment',
    activeLoans: 'Active Loans',
    loanHistory: 'Loan History',
    noActiveLoans: 'No active loans',
    
    // Meetings
    scheduleMeeting: 'Schedule Meeting',
    meetingTitle: 'Meeting Title',
    meetingDate: 'Date',
    meetingTime: 'Time',
    meetingVenue: 'Venue',
    meetingAgenda: 'Agenda',
    meetingMinutes: 'Minutes',
    attendees: 'Attendees',
    upcoming: 'Upcoming',
    cancelled: 'Cancelled',
    sendReminder: 'Send Reminder',
    viewAgenda: 'View Agenda',
    
    // Settings
    chamaInfo: 'Chama Information',
    chamaName: 'Chama Name',
    registrationNumber: 'Registration Number',
    location: 'Location',
    founded: 'Founded',
    meetingSchedule: 'Meeting Schedule',
    monthlyContributionAmount: 'Monthly Contribution (KSh)',
    loanInterestRate: 'Loan Interest Rate (%)',
    notifications: 'Notifications',
    mpesaSettings: 'M-Pesa Settings',
    security: 'Security',
    saveChanges: 'Save Changes',
    settingsSaved: 'Settings saved successfully',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    totalChamas: 'Total Chamas',
    totalUsers: 'Total Users',
    revenue: 'Revenue',
    systemHealth: 'System Health',
    recentLogs: 'Recent Logs',
    userManagement: 'User Management',
    allUsers: 'All Users',
    addUser: 'Add User',
    editUser: 'Edit User',
    userRole: 'Role',
    userStatus: 'Status',
    lastLogin: 'Last Login',
    systemLogs: 'System Logs',
    logLevel: 'Level',
    logAction: 'Action',
    logDetails: 'Details',
    exportLogs: 'Export Logs',
    clearLogs: 'Clear Logs',
    databaseBackup: 'Database Backup',
    cacheClear: 'Clear Cache',
    systemUpdate: 'System Update',
    
    // Errors
    somethingWentWrong: 'Something went wrong',
    tryAgain: 'Try Again',
    networkError: 'Network error. Please check your connection.',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    notFound: 'Not found',
    serverError: 'Server error',
    
    // Sound/Alerts
    newMessage: 'New message',
    paymentReceived: 'Payment received',
    loanApproved: 'Loan approved',
    meetingReminder: 'Meeting reminder',
    contributionReminder: 'Contribution reminder',
    warning: 'Warning',
    info: 'Information',
  },
  sw: {
    // Common
    loading: 'Inapakia...',
    error: 'Hitilafu',
    success: 'Imefaulu',
    cancel: 'Ghairi',
    save: 'Hifadhi',
    delete: 'Futa',
    edit: 'Hariri',
    add: 'Ongeza',
    search: 'Tafuta',
    filter: 'Chuja',
    export: 'Toa',
    import: 'Ingiza',
    confirm: 'Thibitisha',
    yes: 'Ndiyo',
    no: 'Hapana',
    close: 'Funga',
    back: 'Rudi',
    next: 'Mbele',
    previous: 'Nyuma',
    submit: 'Wasilisha',
    skip: 'Ruka',
    done: 'Kamili',
    refresh: 'Pakia upya',
    view: 'Tazama',
    actions: 'Vitendo',
    status: 'Hali',
    name: 'Jina',
    email: 'Barua pepe',
    phone: 'Nambari ya simu',
    amount: 'Kiasi',
    date: 'Tarehe',
    time: 'Muda',
    total: 'Jumla',
    pending: 'Inangojea',
    completed: 'Imekamilika',
    failed: 'Imeshindikana',
    
    // Auth
    login: 'Ingia',
    logout: 'Toka',
    signIn: 'Ingia',
    signUp: 'Jisajili',
    signOut: 'Toka',
    forgotPassword: 'Umesahau nywila?',
    resetPassword: "Weka nywila mpya",
    emailPlaceholder: 'wewe@mfano.com',
    passwordPlaceholder: 'Andika nywila',
    confirmPassword: 'Thibitisha nywila',
    rememberMe: 'Kumbuka',
    dontHaveAccount: 'Huna akaunti?',
    alreadyHaveAccount: 'Tayari una akaunti?',
    createAccount: 'Fungua akaunti',
    verifyEmail: 'Thibitisha barua pepe',
    emailSent: 'Barua pepe imetumwa!',
    checkInbox: 'Angalia inbox yako',
    resendEmail: 'Tuma tena',
    invalidCredentials: 'Taarifa si sahihi',
    emailRequired: 'Barua pepe inahitajika',
    passwordRequired: 'Nywila inahitajika',
    passwordMinLength: 'Nywila inakuwa na herufi 6 au zaidi',
    passwordsDoNotMatch: 'Nywila hazifanani',
    loginSuccess: 'Umeingia kwa mafanikio!',
    signupSuccess: 'Akaunti imeundwa! Thibitisha barua pepe yako.',
    logoutSuccess: 'Umetoka kwa mafanikio',
    
    // Navigation
    dashboard: 'Dashibodi',
    members: 'Wanachama',
    contributions: 'Mchango',
    loans: 'Mikopo',
    meetings: 'Mikutano',
    analytics: 'Takwimu',
    settings: 'Mipangilio',
    pricing: 'Boresha',
    adminPanel: 'Paneli ya Admin',
    tools: 'Vifaa na kumbukumbu',
    reports: 'Ripoti',
    systemSettings: 'Mipangilio ya mfumo',
    
    // Dashboard
    goodMorning: 'Asubuhi njema',
    goodAfternoon: 'Mchana mwema',
    goodEvening: 'Jioni njema',
    totalFund: 'Jumla ya Pesa',
    activeMembers: 'Wanachama walio hai',
    loansOutstanding: 'Mikopo isiyolipwa',
    interestEarned: 'Faida iliyopatikana',
    upcomingMeeting: 'Mikutano ijayo',
    topContributors: 'Wachangiaji bora',
    recentActivity: 'Shughuli za karibuni',
    overdueLoans: 'Mikopo iliyochelewa',
    fundGrowth: 'Mwenendo wa Pesa',
    contributionProgress: 'Mwenendo wa Mchango',
    
    // Members
    addMember: 'Ongeza Mwanachama',
    editMember: 'Hariri Mwanachama',
    deleteMember: 'Futa Mwanachama',
    memberDetails: 'Taarifa za Mwanachama',
    memberName: 'Jina kamili',
    memberPhone: 'Nambari ya simu',
    memberEmail: 'Barua pepe',
    memberRole: 'Wajibu',
    joinDate: 'Tarehe ya kujiunga',
    totalContributed: 'Jumla iliyochangiwa',
    totalLoans: 'Jumla ya mkopo',
    shares: 'Sehemu',
    active: 'Mwenye nguvu',
    inactive: 'Asiyefanya kazi',
    chairman: 'Mwenyekiti',
    treasurer: 'Mhazini',
    secretary: 'Katibu',
    member: 'Mwanachama',
    searchMembers: 'Tafuta wanachama...',
    noMembersFound: 'Hakuna wanachama walionekana',
    
    // Contributions
    addContribution: 'Ongeza Mchango',
    recordPayment: 'Rekodi malipo',
    mpesaReconciliation: 'Mkondano wa M-Pesa',
    contributionHistory: 'Historia ya Mchango',
    monthlyContributionAmt: 'Mchango wa kila mwezi',
    paid: 'Imelipwa',
    overdue: 'Imechelewa',
    mpesaRef: 'Kumbukumbu ya M-Pesa',
    selectMonth: 'Chagua mwezi',
    allStatuses: 'Hali zote',
    
    // Loans
    applyLoan: 'omba mkopo',
    approveLoan: 'Kubali mkopo',
    rejectLoan: 'Kataa mkopo',
    loanAmount: 'Kiasi cha mkopo',
    loanPurpose: 'Lengo',
    loanInterest: 'Kiwango cha riba',
    loanBalance: 'Salio',
    disbursedDate: 'Tarehe ya kutoa',
    dueDate: 'Tarehe ya kulipa',
    repayment: 'Kulipa',
    activeLoans: 'Mikopo hai',
    loanHistory: 'Historia ya mikopo',
    noActiveLoans: 'Hakuna mikopo hai',
    
    // Meetings
    scheduleMeeting: 'Langa mkutano',
    meetingTitle: 'Kichwa cha mkutano',
    meetingDate: 'Tarehe',
    meetingTime: 'Muda',
    meetingVenue: 'Mahali',
    meetingAgenda: 'Ajenda',
    meetingMinutes: 'Kumbukumbu',
    attendees: 'Washiriki',
    upcoming: 'Ijayo',
    cancelled: 'Kufutwa',
    sendReminder: 'Tuma ukumbusho',
    viewAgenda: 'Tazama ajenda',
    
    // Settings
    chamaInfo: 'Taarifa za Chama',
    chamaName: 'Jina la Chama',
    registrationNumber: 'Nambari ya usajili',
    location: 'Mahali',
    founded: 'Iliundwa',
    meetingSchedule: 'Ratiba ya mikutano',
    monthlyContributionAmount: 'Mchango wa kila mwezi (KSh)',
    loanInterestRate: 'Kiwango cha riba ya mkopo (%)',
    notifications: 'Arifu',
    mpesaSettings: 'Mipangilio ya M-Pesa',
    security: 'Usalama',
    saveChanges: 'Hifadhi mabadiliko',
    settingsSaved: 'Mipangilio imehifadhiwa',
    
    // Admin
    adminDashboard: 'Dashibodi ya Admin',
    totalChamas: 'Jumla ya Chama',
    totalUsers: 'Jumla ya watumiaji',
    revenue: 'Mapato',
    systemHealth: 'Afya ya mfumo',
    recentLogs: 'Kumbukumbu za karibuni',
    userManagement: 'Usimamizi wa watumiaji',
    allUsers: 'Watumiaji wote',
    addUser: 'Ongeza Mtumiaji',
    editUser: 'Hariri Mtumiaji',
    userRole: 'Wajibu',
    userStatus: 'Hali',
    lastLogin: 'Mwisho wa kuingia',
    systemLogs: 'Kumbukumbu za mfumo',
    logLevel: 'Kiwango',
    logAction: 'Kitendo',
    logDetails: 'Maelezo',
    exportLogs: 'Toa kumbukumbu',
    clearLogs: 'Futa kumbukumbu',
    databaseBackup: 'Hifadhi data',
    cacheClear: 'Futa cache',
    systemUpdate: 'Sasisha mfumo',
    
    // Errors
    somethingWentWrong: 'Kuna kitu kilichokosa',
    tryAgain: 'Jaribu tena',
    networkError: 'Hitilafu ya mtandao. Angalia muunganisho wako.',
    unauthorized: 'Ufikiaji usiogezwe',
    forbidden: 'Ufikiazi umekatazwa',
    notFound: 'Haionekana',
    serverError: 'Hitilafu ya server',
    
    // Sound/Alerts
    newMessage: 'Ujumbe mpya',
    paymentReceived: 'Malipo yamepokelewa',
    loanApproved: 'Mkopo umekubaliwa',
    meetingReminder: 'Kumbusho la mkutano',
    contributionReminder: 'Kumbusho la mchango',
    warning: 'Onyo',
    info: 'Habari',
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}