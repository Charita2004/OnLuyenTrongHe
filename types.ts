
export interface Step {
  id: number;
  label: string;
}

export interface ReExamItem {
  id: string;
  category: string; // e.g., 'MÔN HỌC', 'PHẨM CHẤT CHỦ YẾU'
  subjectName: string; // e.g., 'Toán', 'Chăm chỉ'
  currentScore: string; // e.g., 'Điểm 4.5', 'Cần cố gắng', or 'Mức C\nĐiểm 4'
  hasDoubleAuth?: boolean; // NEW: If true, requires both Level (T/H/C) and Score (0-10)
  badgeColor: 'red' | 'yellow' | 'orange';
  trainingContent: string;
  inputType: 'text' | 'select';
  options?: string[]; // For select inputs
  result?: string; // New field to store user input. For double auth, format is "LEVEL|SCORE"
}

export interface StudentData {
  id: string;
  code: string;
  fullName: string;
  className: string;
  items: ReExamItem[];
  isApprovedByPrincipal?: boolean; // New field for Step 4 override
  summary: {
    academic: string;
    qualities: string;
    promotion: string;
    finalReason?: string; // New field for Step 2 reason
  };
}

export interface Student {
  id: number;
  register: boolean;
  className: string;
  fullName: string;
  dob: string;
  content: string;
  reason: string;
  isFailing: boolean;
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatarColor: string; // Tailwind class
  initial: string;
}

export type TabType = 'academic' | 'quality' | 'summary';

export type ProcessStatus = 'INIT' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'FINALIZED';
