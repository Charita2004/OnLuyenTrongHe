import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Menu, ChevronRight, ChevronLeft, Send, CheckSquare, Lock, XCircle, CheckCircle, X,
  Search, Maximize, Bell, ArrowLeft, ChevronDown, Check, LogOut, Clock, FileText, AlertCircle, RotateCcw, Filter, AlertTriangle, Play, Eye, List
} from 'lucide-react';
import { Stepper } from './components/Stepper';
import { ReExamTable } from './components/ReExamTable';
import { Sidebar } from './components/Sidebar';
import { InitializationScreen } from './components/InitializationScreen';
import { Step, StudentData, User, ProcessStatus } from './types';

// Steps
const STEPS: Step[] = [
  { id: 1, label: 'Nhập kết quả rèn luyện' },
  { id: 2, label: 'Tổng hợp kết quả' },
  { id: 3, label: 'Gửi Hiệu trưởng xét duyệt' },
  { id: 4, label: 'Hiệu trưởng xét duyệt' },
  { id: 5, label: 'Chốt sổ' },
];

// Mock Users Data
const MOCK_USERS: User[] = [
  { 
    id: 'principal', 
    name: 'Cô Phạm Thị Thu', 
    role: 'Hiệu trưởng', 
    avatarColor: 'bg-purple-600', 
    initial: 'HT' 
  },
  { 
    id: 'teacher', 
    name: 'Cô Nguyễn Thị Lan', 
    role: 'GV Chủ nhiệm', 
    avatarColor: 'bg-teal-600', 
    initial: 'GV' 
  },
];

// Configuration for Filter
const GRADES = [
    { value: '1', label: 'Khối 1' },
    { value: '2', label: 'Khối 2' },
    { value: '3', label: 'Khối 3' },
    { value: '4', label: 'Khối 4' },
    { value: '5', label: 'Khối 5' },
];

const CLASSES: Record<string, string[]> = {
    '5': ['5A1', '5A2', '5B', '5C'],
    '4': ['4A1', '4B'],
    '3': ['3A', '3B'],
    '2': ['2A', '2B'],
    '1': ['1A', '1C'],
};

// Initial Mock Data Factory Function
const getInitialData = (): StudentData[] => [
  // =========================================================================
  // LỚP 5A1 (Lớp INTERACTIVE - Của GVCN Demo)
  // Trạng thái: Chưa nhập liệu (hoặc nhập dở), chờ người dùng thao tác
  // =========================================================================
  {
    id: '1',
    code: 'HS5A1_01',
    fullName: 'Nguyễn Văn An',
    className: '5A1',
    items: [
      {
        id: 'i1_1',
        category: 'MÔN HỌC',
        subjectName: 'Toán',
        currentScore: 'Mức C\nĐiểm 4',
        hasDoubleAuth: true,
        badgeColor: 'red',
        trainingContent: 'Toán',
        inputType: 'text',
        result: '' // Để trống cho người dùng nhập
      },
      {
        id: 'i1_2',
        category: 'MÔN HỌC',
        subjectName: 'Tiếng Việt',
        currentScore: 'Điểm 4',
        badgeColor: 'red',
        trainingContent: 'Tiếng Việt',
        inputType: 'text',
        result: ''
      },
      {
        id: 'i1_3',
        category: 'NĂNG LỰC CHUNG',
        subjectName: 'Tự chủ và tự học',
        currentScore: 'C (Cần cố gắng)',
        badgeColor: 'yellow',
        trainingContent: 'Rèn luyện sự tự giác',
        inputType: 'select',
        options: ['T', 'Đ', 'C'],
        result: ''
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },
  {
    id: '2',
    code: 'HS5A1_02',
    fullName: 'Trần Văn Bảo',
    className: '5A1',
    items: [
      {
        id: 'i2_1',
        category: 'MÔN HỌC',
        subjectName: 'Giáo dục thể chất',
        currentScore: 'C (Chưa hoàn thành)',
        badgeColor: 'red',
        trainingContent: 'Rèn luyện thể lực',
        inputType: 'select',
        options: ['T', 'H', 'C'],
        result: ''
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },
  {
    id: '3',
    code: 'HS5A1_03',
    fullName: 'Lê Thị Cẩm',
    className: '5A1',
    items: [
      {
        id: 'i3_1',
        category: 'MÔN HỌC',
        subjectName: 'Toán',
        currentScore: 'Điểm 3',
        badgeColor: 'red',
        trainingContent: 'Ôn tập kiến thức cơ bản',
        inputType: 'text',
        result: ''
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },

  // =========================================================================
  // LỚP 5A2 (Lớp MOCK - Đã Gửi Duyệt)
  // Trạng thái: Giáo viên đã nhập xong (có result), chưa được HT duyệt
  // =========================================================================
  {
    id: '4',
    code: 'HS5A2_01',
    fullName: 'Phạm Hùng Dũng',
    className: '5A2',
    items: [
       {
        id: 'i4_1',
        category: 'MÔN HỌC',
        subjectName: 'Toán',
        currentScore: 'Điểm 2',
        badgeColor: 'red',
        trainingContent: 'Củng cố lại bảng cửu chương',
        inputType: 'text',
        result: '4' // Kết quả rèn luyện vẫn chưa đạt (4 < 5)
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: 'Tiếp thu chậm, chưa thuộc bảng cửu chương' }
  },
  {
    id: '4b',
    code: 'HS5A2_02',
    fullName: 'Lê Thị Mai',
    className: '5A2',
    items: [
       {
        id: 'i4b_1',
        category: 'MÔN HỌC',
        subjectName: 'Tiếng Việt',
        currentScore: 'Điểm 4',
        badgeColor: 'red',
        trainingContent: 'Luyện đọc',
        inputType: 'text',
        result: '6' // Đã đạt
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },

  // =========================================================================
  // LỚP 5B (Lớp MOCK - Đã Duyệt)
  // Trạng thái: Đã có kết quả và đã được HT duyệt (isApprovedByPrincipal: true)
  // =========================================================================
  {
    id: '5',
    code: 'HS5B_01',
    fullName: 'Vũ Thị Hoa',
    className: '5B',
    items: [
       {
        id: 'i5_1',
        category: 'PHẨM CHẤT CHỦ YẾU',
        subjectName: 'Trách nhiệm',
        currentScore: 'C (Cần cố gắng)',
        badgeColor: 'orange',
        trainingContent: 'Rèn luyện ý thức giữ gìn vệ sinh',
        inputType: 'select',
        options: ['T', 'Đ', 'C'],
        result: 'C' // Vẫn chưa đạt
      }
    ],
    isApprovedByPrincipal: true, // Đã được HT duyệt cho ở lại lớp hoặc lên lớp (tùy ngữ cảnh)
    summary: { academic: '', qualities: '', promotion: '', finalReason: 'Chưa có chuyển biến trong ý thức' }
  },

  // =========================================================================
  // LỚP 5C (Lớp MOCK - Đã Chốt Sổ)
  // Trạng thái: Dữ liệu sạch
  // =========================================================================
  {
    id: '5c_1',
    code: 'HS5C_01',
    fullName: 'Trần Văn Tý',
    className: '5C',
    items: [
       {
        id: 'i5c_1',
        category: 'MÔN HỌC',
        subjectName: 'Khoa học',
        currentScore: 'Điểm 4',
        badgeColor: 'red',
        trainingContent: 'Ôn tập kiến thức',
        inputType: 'text',
        result: '8' // Đạt
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },

  // =========================================================================
  // KHỐI 4 (4A1) - Đã gửi duyệt
  // =========================================================================
  {
    id: '6',
    code: 'HS4A1_01',
    fullName: 'Ngô Văn Kiên',
    className: '4A1',
    items: [
       {
        id: 'i6_1',
        category: 'MÔN HỌC',
        subjectName: 'Tiếng Việt',
        currentScore: 'Điểm 3',
        badgeColor: 'red',
        trainingContent: 'Luyện đọc diễn cảm',
        inputType: 'text',
        result: '4' // Chưa đạt
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: 'Đọc còn ngọng, chưa ngắt nghỉ đúng' }
  },
  {
    id: '7',
    code: 'HS4A1_02',
    fullName: 'Đặng Thị Lan',
    className: '4A1',
    items: [
       {
        id: 'i7_1',
        category: 'MÔN HỌC',
        subjectName: 'Toán',
        currentScore: 'Điểm 4',
        badgeColor: 'red',
        trainingContent: 'Ôn tập hình học',
        inputType: 'text',
        result: '5' // Đã đạt
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },

  // =========================================================================
  // KHỐI 3 (3A) - Đã gửi duyệt
  // =========================================================================
  {
    id: '8',
    code: 'HS3A_01',
    fullName: 'Bùi Tuấn Minh',
    className: '3A',
    items: [
       {
        id: 'i8_1',
        category: 'NĂNG LỰC ĐẶC THÙ',
        subjectName: 'Mỹ thuật',
        currentScore: 'C (Chưa hoàn thành)',
        badgeColor: 'yellow',
        trainingContent: 'Hoàn thành bài vẽ cuối kỳ',
        inputType: 'select',
        options: ['T', 'H', 'C'],
        result: 'C'
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: 'Không nộp bài tập rèn luyện' }
  },

  // =========================================================================
  // KHỐI 2 (2B) - Đã gửi duyệt
  // =========================================================================
  {
    id: '9',
    code: 'HS2B_01',
    fullName: 'Lý Tiểu Long',
    className: '2B',
    items: [
       {
        id: 'i9_1',
        category: 'MÔN HỌC',
        subjectName: 'Toán',
        currentScore: 'Điểm 3',
        badgeColor: 'red',
        trainingContent: 'Phép cộng có nhớ',
        inputType: 'text',
        result: '3'
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: 'Chưa nắm vững quy tắc cộng có nhớ' }
  },

  // =========================================================================
  // KHỐI 1 (1A) - Đã gửi duyệt
  // =========================================================================
  {
    id: '10',
    code: 'HS1A_01',
    fullName: 'Nguyễn Bích Ngọc',
    className: '1A',
    items: [
       {
        id: 'i10_1',
        category: 'MÔN HỌC',
        subjectName: 'Tiếng Việt',
        currentScore: 'Điểm 4',
        badgeColor: 'red',
        trainingContent: 'Đánh vần và ghép vần',
        inputType: 'text',
        result: '8' // Tiến bộ vượt bậc
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  }
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // User Management State
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[1]); // Default to GVCN
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Flow State
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('INIT'); // Start at INIT
  // Initialize Finalized classes with 5C to demonstrate Step 5 logic
  const [finalizedClasses, setFinalizedClasses] = useState<string[]>(['5C']); 
  const [isSyncing, setIsSyncing] = useState(false); // For INIT mock sync

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [students, setStudents] = useState<StudentData[]>(getInitialData);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Filter State (For Principal)
  const [selectedGrade, setSelectedGrade] = useState<string>('1'); // Default to Grade 1
  const [selectedClass, setSelectedClass] = useState<string>(CLASSES['1'][0]); // Initialize with first class of Grade 1

  // Step 5 Master-Detail View State
  const [step5View, setStep5View] = useState<'master' | 'detail'>('master');
  // New State for Master View Checkboxes
  const [selectedClassesForLock, setSelectedClassesForLock] = useState<string[]>([]);

  // Step 5 specific states
  const [step5Tab, setStep5Tab] = useState<'passed' | 'failed'>('passed');
  const [showSuccessModal, setShowSuccessModal] = useState(false); // For Step 5 Finalize
  const [showApprovalModal, setShowApprovalModal] = useState(false); // For Step 4 Approval
  const [showNoSelectionModal, setShowNoSelectionModal] = useState(false); // For Step 4 Warning
  const [showSendWarningModal, setShowSendWarningModal] = useState(false); // For Step 3 Confirm
  const [showStartConfirmModal, setShowStartConfirmModal] = useState(false); // For Step 0 Confirm

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Logic 2: Initialize Step based on Role 
  // IMPORTANT: We do NOT reset data here anymore, so Principal can see Teacher's input
  useEffect(() => {
    // Clear selection to avoid UI bugs with checkboxes across roles
    setSelectedStudentIds([]);
    
    // Set Navigation defaults based on Role
    if (currentUser.id === 'principal') {
      // If still in INIT, Principal sees that status (handled in render)
      // Otherwise, go to Step 4
      if (processStatus !== 'INIT') {
         setCurrentStep(4);
      } else {
         // If Principal accesses Step 1, 2, 3 but process is not INIT, it's fine (ReadOnly mode)
         // Default to Step 4 if valid
         setCurrentStep(4);
      }
    } else {
       // Teacher Logic
       if (processStatus !== 'INIT') {
         setCurrentStep(1);
       }
    }
  }, [currentUser]);

  // Reset Step 5 View to Master when navigation out or on role change
  useEffect(() => {
      if (currentStep !== 5) {
          setStep5View('master');
          setSelectedClassesForLock([]); // Reset class selection
      }
  }, [currentStep]);

  // --- SUBMITTED CLASSES LOGIC (Mock) ---
  const submittedClasses = useMemo(() => {
      // Dynamic: 5A1 based on status (If submitted/approved/finalized, it's visible)
      const dynamic = ['SUBMITTED', 'APPROVED', 'FINALIZED'].includes(processStatus) ? ['5A1'] : [];
      
      // Static mocks for demo (These represent classes that have *already* finished Step 3 by their respective teachers)
      // Note: 5C is finalized, so it effectively has been submitted.
      const staticMocks = ['5A2', '5B', '5C', '4A1', '3A', '2B', '1A']; 
      
      return [...dynamic, ...staticMocks];
  }, [processStatus]);

  // --- FILTER OPTIONS ---
  const gradeOptions = useMemo(() => {
      if (currentUser.id === 'principal' && currentStep === 4) {
          // Only grades that have at least one submitted class
          const activeGrades = new Set(submittedClasses.map(c => c.replace(/[^0-9]/g, ''))); // e.g. '5' from '5A1'
          return GRADES.filter(g => activeGrades.has(g.value));
      }
      return GRADES;
  }, [currentUser, currentStep, submittedClasses]);

  const classOptions = useMemo(() => {
      const allForGrade = CLASSES[selectedGrade] || [];
      if (currentUser.id === 'principal' && currentStep === 4) {
           return allForGrade.filter(c => submittedClasses.includes(c));
      }
      return allForGrade;
  }, [currentUser, currentStep, selectedGrade, submittedClasses]);

  // Logic 2b: Enforce specific class selection for Principal (Updated for Step 4 filter)
  useEffect(() => {
    if (currentUser.id === 'principal') {
        // 1. Validate Grade
        // If current selectedGrade is not in the allowed options (e.g. switched to Step 4 and Grade 1 has no submitted classes)
        const isGradeValid = gradeOptions.some(g => g.value === selectedGrade);
        
        if (!isGradeValid && gradeOptions.length > 0) {
            // Pick the first available grade
            const newGrade = gradeOptions[0].value;
            setSelectedGrade(newGrade);
            // We'll let the next render cycle or the Class validation block handle the class update 
            // to avoid race conditions, but we can also check classes here for safety.
            // However, since classOptions depends on selectedGrade, it will update in next render.
            return; 
        }

        // 2. Validate Class
        // Only proceed if grade is valid (or just became valid)
        // Note: classOptions updates when selectedGrade updates.
        const isClassValid = classOptions.includes(selectedClass);
        if (!isClassValid) {
             if (classOptions.length > 0) {
                 setSelectedClass(classOptions[0]);
             } else {
                 // Fallback if current grade has no classes (shouldn't happen if data consistent)
                 // Or if waiting for grade update.
                 // We can set to empty or handle gracefully.
             }
        }
    }
  }, [currentStep, currentUser, gradeOptions, classOptions, selectedGrade, selectedClass]);

  // Manual Reset Function for Demo Purposes (User Menu)
  const handleResetDemo = () => {
    setStudents(getInitialData());
    setProcessStatus('INIT'); // Reset to INIT
    setFinalizedClasses(['5C']); // Reset finalized classes (keep 5C as mock finalized)
    setSelectedStudentIds([]);
    setSelectedClassesForLock([]);
    setStep5Tab('passed');
    setCurrentStep(1);
    setStep5View('master');
    setUserMenuOpen(false);
    setSelectedGrade('1');
    setSelectedClass(CLASSES['1'][0]); // Reset Filter to first class of Grade 1
    // Force switch to teacher for a clean start
    if (currentUser.id === 'principal') {
        setCurrentUser(MOCK_USERS[1]);
    }
  };

  // Logic 3: Permission Check (isEditable) - UPDATED with ProcessStatus
  const isEditable = useMemo(() => {
    if (currentUser.id === 'teacher') {
      // Teacher can only edit Step 1-3 AND when status is DRAFT
      return currentStep <= 3 && processStatus === 'DRAFT';
    } else if (currentUser.id === 'principal') {
      // Principal can edit Step 4 (Approving)
      if (currentStep === 4) return true;
      // Principal can edit Step 5 (Finalizing) only if APPROVED
      if (currentStep === 5) return processStatus === 'APPROVED';
    }
    return false;
  }, [currentUser, currentStep, processStatus]);

  // Navigation Constraint for Stepper
  const maxStepAllowed = useMemo(() => {
    if (currentUser.id === 'teacher') return 5; // Teacher can click up to 5 to see the "Waiting" screens
    return 5; // Principal sees all
  }, [currentUser]);


  // Determine the tab to display based on the current step
  const displayTab = (currentStep >= 2) ? 'summary' : 'academic'; 

  // --- FILTERING LOGIC ---
  const filteredStudents = useMemo(() => {
    let result = students;

    // 1. Role-based filtering
    if (currentUser.id === 'teacher') {
        // Teacher sees only their class (Mock: 5A1)
        result = result.filter(s => s.className === '5A1');
    } 
    // 2. Principal filtering (Only in Step 4 & 5)
    else if (currentUser.id === 'principal') {
        
        // Filter by Grade (Startswith check, e.g., '5A1' starts with '5')
        if (selectedGrade !== 'ALL') {
             result = result.filter(s => s.className.startsWith(selectedGrade));
        }

        // Filter by Class
        if (selectedClass !== 'ALL') {
            result = result.filter(s => s.className === selectedClass);
        }
    }
    
    return result;
  }, [students, currentUser, currentStep, selectedGrade, selectedClass]);


  // Helper: Check student status
  const checkStudentPass = (student: StudentData) => {
    if (student.isApprovedByPrincipal) return true;
    
    // Check academic pass
    const isAcademicFail = student.items.some(item => {
      const val = item.result?.trim() || ''; 
      
      // Handle Double Auth Logic (Hybrid Assessment)
      if (item.hasDoubleAuth) {
         // Expect val format: "LEVEL|SCORE"
         const parts = val.split('|');
         const level = parts[0];
         const scoreStr = parts[1];
         const score = parseFloat(scoreStr);
         
         // Fail condition: Level is C OR Score < 5 OR Score invalid
         if (level === 'C' || isNaN(score) || score < 5) return true; // Fail
         if (!level || !scoreStr) return true; // Fail if incomplete
         return false; // Pass
      }

      if (item.inputType === 'text') {
        const num = parseFloat(val);
        return isNaN(num) || num < 5; 
      }
      return val === 'C' || val === '' || val === 'Chưa đạt' || val === 'Chưa hoàn thành';
    });
    
    return !isAcademicFail;
  };

  // Helper: Get Class Status for Filter Badge
  const getClassStatus = (cls: string) => {
    if (finalizedClasses.includes(cls)) return { label: 'Đã chốt sổ', color: 'bg-green-100 text-green-700 border-green-200' };
    
    // Note: In this mock app, processStatus is global. In a real app, this would be per-class status.
    // We simulate per-class status loosely here based on the global state for demo purposes.
    switch(processStatus) {
        case 'INIT': return { label: 'Chưa bắt đầu', color: 'bg-gray-100 text-gray-500 border-gray-200' };
        case 'DRAFT': return { label: 'Đang nhập liệu', color: 'bg-blue-50 text-blue-700 border-blue-200' };
        case 'SUBMITTED': return { label: 'Chờ duyệt', color: 'bg-orange-50 text-orange-700 border-orange-200' };
        case 'APPROVED': return { label: 'Đã duyệt', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
        case 'FINALIZED': return { label: 'Đã chốt sổ', color: 'bg-green-100 text-green-700 border-green-200' };
        default: return { label: '---', color: 'bg-gray-100 text-gray-500 border-gray-200' };
    }
  };

  // Calculate counts based on FILTERED students
  const passedCount = useMemo(() => filteredStudents.filter(s => checkStudentPass(s)).length, [filteredStudents]);
  const failedCount = useMemo(() => filteredStudents.length - passedCount, [filteredStudents]);

  // --- STEP 5: MASTER DATA AGGREGATION ---
  const step5SummaryData = useMemo(() => {
    let classesToShow = Object.values(CLASSES).flat();

    // Filter by Grade if in Step 5 Master View (using selectedGrade state)
    if (selectedGrade !== 'ALL') {
         classesToShow = classesToShow.filter(cls => cls.startsWith(selectedGrade));
    }

    return classesToShow.map(cls => {
        // Count student in this class from the mock data
        const count = students.filter(s => s.className === cls).length;
        const isLocked = finalizedClasses.includes(cls);
        return { className: cls, count, isLocked };
    }).filter(item => item.count > 0); // Only show classes with students for demo
  }, [students, finalizedClasses, selectedGrade]);


  // --- SELECT ALL LOGIC (For Step 4) ---
  const studentsVisibleForSelection = useMemo(() => {
     // In Step 4, the table shows 'failed' students. 
     // This includes those who failed academic check AND haven't been approved yet.
     // NOTE: `checkStudentPass` returns TRUE if approved. So `!checkStudentPass` returns unapproved failures.
     if (currentStep === 4) {
         return filteredStudents.filter(s => !checkStudentPass(s));
     }
     return [];
  }, [filteredStudents, currentStep]);

  const isAllSelected = useMemo(() => {
     if (studentsVisibleForSelection.length === 0) return false;
     return studentsVisibleForSelection.every(s => selectedStudentIds.includes(s.id));
  }, [studentsVisibleForSelection, selectedStudentIds]);

  const handleToggleSelectAll = () => {
     if (isAllSelected) {
         // Deselect all visible
         const idsToDeselect = studentsVisibleForSelection.map(s => s.id);
         setSelectedStudentIds(prev => prev.filter(id => !idsToDeselect.includes(id)));
     } else {
         // Select all visible
         const idsToSelect = studentsVisibleForSelection.map(s => s.id);
         setSelectedStudentIds(prev => [...new Set([...prev, ...idsToSelect])]);
     }
  };

  // Data Handlers
  const handleUpdateResult = (studentId: string, itemId: string, value: string) => {
    if (!isEditable) return; 
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      return {
        ...student,
        items: student.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, result: value };
        })
      };
    }));
  };

  const handleUpdateSummaryReason = (studentId: string, value: string) => {
    if (!isEditable) return;
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      return {
        ...student,
        summary: { ...student.summary, finalReason: value }
      };
    }));
  };

  const handleToggleSelectStudent = (studentId: string) => {
    if (!isEditable) return;
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Master View Lock Selection Logic
  const handleToggleClassLockSelection = (className: string) => {
      if (finalizedClasses.includes(className)) return; // Already locked
      setSelectedClassesForLock(prev => 
          prev.includes(className)
            ? prev.filter(c => c !== className)
            : [...prev, className]
      );
  };

  const handleBatchFinalize = () => {
      if (selectedClassesForLock.length === 0) return;
      setFinalizedClasses(prev => [...new Set([...prev, ...selectedClassesForLock])]);
      setSelectedClassesForLock([]);
      setShowSuccessModal(true);
  };


  // ACTIONS

  // 0. INIT Actions
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
        setIsSyncing(false);
        // Mock refreshing data
        setStudents(getInitialData()); 
    }, 1000);
  }

  const handleStartProcess = () => {
      setShowStartConfirmModal(true);
  }

  const confirmStartProcess = () => {
      setProcessStatus('DRAFT');
      setCurrentStep(1);
      setShowStartConfirmModal(false);
  }

  // 1. Teacher Sends to Principal (Step 3) - Trigger Modal
  const handleSendToPrincipalClick = () => {
    if (processStatus !== 'DRAFT') return;
    setShowSendWarningModal(true);
  };

  // 1b. Actually Confirm Send
  const confirmSendToPrincipal = () => {
     setProcessStatus('SUBMITTED');
     setCurrentStep(4);
     setShowSendWarningModal(false);
  };

  // 2. Principal Approves (Step 4)
  const handleApproveSelected = () => {
    // Only proceed if Principal
    if (currentUser.role !== 'Hiệu trưởng') return;

    // Check if selection is empty
    if (selectedStudentIds.length === 0) {
        setShowNoSelectionModal(true);
        return;
    }

    if (selectedStudentIds.length > 0) {
      setStudents(prev => prev.map(student => {
        if (selectedStudentIds.includes(student.id)) {
          return { ...student, isApprovedByPrincipal: true };
        }
        return student;
      }));
      setSelectedStudentIds([]);
    }
    
    // Change Status to APPROVED
    setProcessStatus('APPROVED');
    setShowApprovalModal(true);
  };

  // 2b. Principal Continues (Step 4 -> 5)
  // New handler for clicking "Continue" without necessarily approving via checkbox
  const handlePrincipalStep4Continue = () => {
     // If status is not yet APPROVED or FINALIZED, upgrade it to APPROVED so Step 5 actions are enabled.
     if (processStatus === 'SUBMITTED' || processStatus === 'DRAFT') {
         setProcessStatus('APPROVED');
     }
     setCurrentStep(5);
  };

  // 3. Principal Finalizes (Step 5) - SINGLE CLASS from Detail View
  const handleFinalizeSingleClass = () => {
     // Only proceed if Principal and Status is APPROVED
     if (currentUser.role !== 'Hiệu trưởng' || processStatus !== 'APPROVED') return;

     // Ensure a specific class is selected
     if (selectedClass === 'ALL') {
        alert("Vui lòng chọn một lớp cụ thể để chốt sổ!");
        return;
     }

     // Add current selected class to finalized list
     if (!finalizedClasses.includes(selectedClass)) {
         setFinalizedClasses(prev => [...prev, selectedClass]);
     }
     
     setShowSuccessModal(true);
  }

  // 4. Principal View Details in Step 5
  const handleViewDetails = (className: string) => {
      // 1. Set the global selected class so filters work
      setSelectedClass(className);
      // 2. Switch View
      setStep5View('detail');
  };

  const isStep1Complete = useMemo(() => {
    return students.every(student => 
      student.items.every(item => {
        if (item.hasDoubleAuth) {
           const parts = (item.result || '').split('|');
           return parts.length === 2 && parts[0] !== '' && parts[1] !== '';
        }
        return item.result && item.result.trim() !== '';
      })
    );
  }, [students]);

  // --- RENDER HELPERS ---

  // Check if we should show the "Waiting for Principal" screen for Teacher at Step 4
  const showTeacherWaitingScreen = currentUser.id === 'teacher' && currentStep === 4 && (processStatus === 'DRAFT' || processStatus === 'SUBMITTED');

  // Check if we should show the "Not Finalized" screen for Teacher at Step 5
  // Updated: Checks if Teacher's class (5A1) is in the finalizedClasses list
  const showTeacherNotFinalizedScreen = currentUser.id === 'teacher' && currentStep === 5 && !finalizedClasses.includes('5A1');

  // NEW: Check if we should show the "Waiting for Teacher" screen for Principal in Steps 1, 2, 3
  const showPrincipalWaitingForTeacher = currentUser.id === 'principal' && currentStep <= 3 && processStatus === 'INIT';


  // Badge Color helper for Status
  const getStatusBadge = () => {
    // For Principal viewing Step 5, show status specific to selected class
    if (currentUser.id === 'principal' && currentStep === 5 && selectedClass !== 'ALL' && finalizedClasses.includes(selectedClass)) {
         return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">Lớp {selectedClass} đã chốt sổ</span>;
    }

    switch (processStatus) {
      case 'INIT': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-500 text-white border border-gray-600">Khởi tạo</span>;
      case 'DRAFT': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">Đang nhập liệu</span>;
      case 'SUBMITTED': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200 animate-pulse">Chờ duyệt</span>;
      case 'APPROVED': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200">Đã duyệt</span>;
      case 'FINALIZED': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">Đã chốt sổ</span>; // Global Fallback
    }
  };

  const getHeaderContent = () => {
    // Dynamic Class Name Logic
    const targetClass = currentUser.id === 'teacher' ? '5A1' : (selectedClass === 'ALL' ? '...' : selectedClass);

    switch (currentStep) {
      case 1:
        return { title: `Rèn luyện hè - Lớp ${targetClass}`, desc: 'Cập nhật kết quả rèn luyện trong hè (Môn học, Năng lực, Phẩm chất)' };
      case 2:
        return { title: 'Tổng hợp kết quả xét lên lớp', desc: 'Kiểm tra và chốt kết quả xét lên lớp sau rèn luyện' };
      case 3:
        return { title: 'Gửi Hiệu trưởng xét duyệt', desc: 'Hãy kiểm tra kết quả học sinh thật kỹ và nhập lý do cho những học sinh không đủ điều kiện lên lớp' };
      case 4:
        return { title: 'Hiệu trưởng xét duyệt', desc: 'Hiệu trưởng xét duyệt cho những học sinh không đủ điều kiện lên lớp sau rèn luyện lại' };
      case 5:
        return { title: 'Chốt sổ kết quả rèn luyện hè', desc: 'Danh sách chính thức học sinh lên lớp và ở lại lớp sau xét duyệt' };
      default:
        return { title: 'Khóa sổ', desc: '' };
    }
  };
  const headerInfo = getHeaderContent();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans relative">
      
      {/* Modals */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-md shadow-xl w-full max-w-[480px] transform transition-all scale-100 py-12 px-10 flex flex-col items-center justify-center text-center">
             <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
             <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50"><CheckCircle className="w-12 h-12 text-green-600" /></div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Chốt sổ {selectedClassesForLock.length > 0 ? `${selectedClassesForLock.length} lớp` : (selectedClass !== 'ALL' ? `lớp ${selectedClass}` : '')} thành công!</h3>
             <p className="text-gray-500 text-center mb-8">Dữ liệu kết quả rèn luyện hè của lớp đã được lưu trữ vào hệ thống.</p>
             <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">Đóng</button>
          </div>
        </div>
      )}

      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-md shadow-xl w-full max-w-[400px] transform transition-all scale-100 py-16 px-8 flex flex-col items-center justify-center text-center">
             <button onClick={() => setShowApprovalModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
             <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50"><CheckCircle className="w-12 h-12 text-blue-600" /></div>
             <h3 className="text-2xl font-bold text-gray-900">Đã phê duyệt!</h3>
          </div>
        </div>
      )}

      {showNoSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-12 px-10 flex flex-col items-center justify-center text-center">
             <button onClick={() => setShowNoSelectionModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
             <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-yellow-50/50"><AlertCircle className="w-12 h-12 text-yellow-600" /></div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa chọn học sinh</h3>
             <p className="text-gray-500 text-center mb-8">Chưa chọn học sinh nào để duyệt.</p>
             <button onClick={() => setShowNoSelectionModal(false)} className="w-full py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">Đóng</button>
          </div>
        </div>
      )}

      {showSendWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-10 px-8 flex flex-col items-center justify-center text-center">
                <button onClick={() => setShowSendWarningModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-yellow-50/50">
                   <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận gửi duyệt</h3>
                <p className="text-gray-500 text-center mb-8 px-2">
                    Kết quả rèn luyện lại của học sinh sau khi gửi cho Hiệu trưởng sẽ không được chỉnh sửa nữa.
                </p>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setShowSendWarningModal(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                        Kiểm tra lại
                    </button>
                    <button 
                        onClick={confirmSendToPrincipal} 
                        className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                        Gửi
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* START PROCESS CONFIRM MODAL */}
      {showStartConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-10 px-8 flex flex-col items-center justify-center text-center">
                <button onClick={() => setShowStartConfirmModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
                   <Lock className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Khởi tạo quy trình rèn luyện hè</h3>
                <p className="text-gray-500 text-center mb-8 px-2">
                    Sổ điểm chính của năm học sẽ bị <b>KHÓA</b> để đảm bảo tính nhất quán dữ liệu trong quá trình rèn luyện lại. Bạn có chắc chắn muốn tiếp tục?
                </p>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setShowStartConfirmModal(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={confirmStartProcess} 
                        className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                        Đồng ý & Bắt đầu
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
          fixed lg:static inset-y-0 left-0 z-30 h-full bg-[#0f172a] shadow-xl transition-all duration-300 ease-in-out flex-shrink-0 border-r border-gray-800
          ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:w-0 lg:translate-x-0 lg:overflow-hidden'}
      `}>
         <div className="w-64 h-full">
           <Sidebar />
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex-shrink-0 z-40 px-4 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20} /></button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900 truncate">Sổ ghi điểm</h1>
              <div className="hidden sm:block">{getStatusBadge()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors hidden sm:block"><Search size={20} /></button>
             <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors hidden sm:block"><Maximize size={20} /></button>
             <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative"><Bell size={20} /><span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span></button>
             <button className="hidden sm:flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm ml-2"><ArrowLeft size={16} /> Quay lại trang chủ</button>

             {/* User Switcher */}
             <div className="relative ml-2" ref={userMenuRef}>
                <div onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>{currentUser.initial}</div>
                    <div className="hidden lg:flex flex-col items-start leading-none mr-2">
                        <span className="text-sm font-bold text-gray-800">{currentUser.name}</span>
                        <span className="text-xs text-gray-500">{currentUser.role}</span>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </div>
                {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">GIẢ LẬP: CHUYỂN ĐỔI TÀI KHOẢN</h3>
                            <p className="text-xs text-gray-400">Chọn user để test phân quyền dữ liệu</p>
                        </div>
                        <div className="py-2">
                            {MOCK_USERS.map((user) => (
                                <button key={user.id} onClick={() => { setCurrentUser(user); setUserMenuOpen(false); }} className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${currentUser.id === user.id ? 'bg-blue-50/50' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 ${user.avatarColor} flex items-center justify-center text-white font-bold`}>{user.initial}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.role}</p>
                                    </div>
                                    {currentUser.id === user.id && <Check size={18} className="text-blue-600" />}
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 p-2">
                             <button onClick={handleResetDemo} className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors mb-1"><RotateCcw size={16} /> Reset Dữ liệu Demo</button>
                             <button className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"><LogOut size={16} /> Đăng xuất</button>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 w-full bg-gray-100">
          <div className="w-full pb-20">
            
            {/* CONDITIONAL RENDER: Step 0 (INIT) vs The Rest */}
            {processStatus === 'INIT' && currentUser.id === 'teacher' ? (
                // --- STEP 0: INIT SCREEN (Teacher Only) ---
                <InitializationScreen 
                    students={filteredStudents}
                    isSyncing={isSyncing}
                    onSync={handleSync}
                    onStart={handleStartProcess}
                />
            ) : (
                // --- EXISTING 5-STEP PROCESS ---
                <>
                    <div className="mb-6">
                    <Stepper 
                        steps={STEPS} 
                        currentStep={currentStep} 
                        onStepClick={(step) => { if (step <= maxStepAllowed) setCurrentStep(step); }}
                        maxStepAllowed={maxStepAllowed}
                    />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-white rounded-t-lg border-b border-gray-200 shadow-sm transition-all">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{headerInfo.title}</h2>
                                    <p className={`mt-1 text-sm ${(currentStep === 3 || currentStep === 4 || currentStep === 5) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                        {headerInfo.desc}
                                        {currentStep === 5 && (
                                            <span className="block mt-1">
                                                Thầy Cô vui lòng thực hiện Chốt sổ để hệ thống cập nhật lại danh sách cho năm học tới , đồng thời phục vụ cho việc sử dụng Sổ theo dõi và Học bạ số
                                            </span>
                                        )}
                                    </p>
                                </div>
                                {/* Header Buttons Removed */}
                            </div>
                        </div>

                        {/* --- FILTER BAR (VISIBLE IN STEPS 1-4 & STEP 5 MASTER) --- */}
                        {currentUser.id === 'principal' && (currentStep !== 5 || step5View !== 'detail') && (
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-1">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm whitespace-nowrap">
                                    <Eye size={20} className="text-blue-600" />
                                    <span>Đang xem dữ liệu của:</span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    {/* Dropdown 1: Grade */}
                                    <select 
                                        value={selectedGrade}
                                        onChange={(e) => {
                                            const newGrade = e.target.value;
                                            setSelectedGrade(newGrade);
                                            // Always select first valid class of new grade
                                            let newClassOptions = CLASSES[newGrade] || [];
                                            if (currentStep === 4) {
                                                newClassOptions = newClassOptions.filter(c => submittedClasses.includes(c));
                                            }
                                            setSelectedClass(newClassOptions[0] || '');
                                        }}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-40 p-2.5"
                                    >
                                        {gradeOptions.map(grade => (
                                            <option key={grade.value} value={grade.value}>{grade.label}</option>
                                        ))}
                                    </select>

                                    {/* Dropdown 2: Class */}
                                    <select 
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-40 p-2.5"
                                    >
                                        {classOptions.map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Right: Class Status Badge */}
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Trạng thái lớp:</span>
                                    {(() => {
                                        const status = getClassStatus(selectedClass);
                                        return (
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                                                {status.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                        
                        {/* --- DETAIL VIEW HEADER (STEP 5 DETAIL) - CONTEXT DISPLAY --- */}
                        {currentStep === 5 && step5View === 'detail' && (
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-right-4">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm whitespace-nowrap">
                                    <Eye size={20} className="text-blue-600" />
                                    <span>Đang xem dữ liệu chi tiết lớp:</span>
                                    <span className="bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded-md ml-2">{selectedClass}</span>
                                </div>
                                
                                {/* Right: Class Status Badge */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Trạng thái lớp:</span>
                                    {(() => {
                                        const status = getClassStatus(selectedClass);
                                        return (
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                                                {status.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                        {/* -------------------------------------------------- */}

                        <div className="p-4 sm:p-6 min-h-[400px]">
                            {/* 1. TEACHER BLOCKING SCREENS */}
                            {showTeacherWaitingScreen && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                        <Clock className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Hồ sơ đang chờ xét duyệt</h3>
                                    <p className="text-gray-500 max-w-md text-center">Bạn đã gửi hồ sơ thành công. Vui lòng chờ Hiệu trưởng kiểm tra và phê duyệt kết quả. Bạn sẽ nhận được thông báo khi hoàn tất.</p>
                                </div>
                            )}

                            {showTeacherNotFinalizedScreen && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white">
                                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                                        <FileText className="w-10 h-10 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có kết quả chốt sổ</h3>
                                    <p className="text-gray-500 max-w-md text-center">Quy trình xét duyệt chưa hoàn tất hoặc chưa được chốt sổ bởi Hiệu trưởng. Vui lòng quay lại sau.</p>
                                </div>
                            )}

                            {/* 2. PRINCIPAL BLOCKING SCREEN (Steps 1-3 when Status is INIT) */}
                            {showPrincipalWaitingForTeacher && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                        <Clock className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Giáo viên chủ nhiệm chưa thực hiện chốt danh sách rèn luyện hè</h3>
                                    <p className="text-gray-500 max-w-md text-center">
                                       Dữ liệu rèn luyện hè đang ở trạng thái <b>Khởi tạo</b>. Vui lòng chờ Giáo viên chủ nhiệm chốt danh sách học sinh rèn luyện lại để xem dữ liệu.
                                    </p>
                                </div>
                            )}
                            
                            {/* 3. TABLE CONTENT (Only show if NOT blocked) */}
                            {!showTeacherWaitingScreen && !showTeacherNotFinalizedScreen && !showPrincipalWaitingForTeacher && (
                                <>
                                {currentStep === 5 ? (
                                    <>
                                        {/* STEP 5: MASTER VIEW (Summary Table) */}
                                        {step5View === 'master' && (
                                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-blue-800">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase w-16 tracking-wider">STT</th>
                                                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tên lớp</th>
                                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Tổng số HS thi lại/RL hè</th>
                                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Khóa sổ</th>
                                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase w-32 tracking-wider">Xem chi tiết</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {step5SummaryData.map((row, index) => (
                                                                <tr key={row.className} className="hover:bg-blue-50 transition-colors">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">{index + 1}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{row.className}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">{row.count}</td>
                                                                    
                                                                    {/* CHECKBOX LOCK COLUMN */}
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                        <div className="flex justify-center">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                disabled={row.isLocked || processStatus !== 'APPROVED'}
                                                                                checked={row.isLocked || selectedClassesForLock.includes(row.className)}
                                                                                onChange={() => handleToggleClassLockSelection(row.className)}
                                                                                className={`w-5 h-5 rounded border-gray-300 focus:ring-blue-500 ${(row.isLocked || processStatus !== 'APPROVED') ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-blue-600 cursor-pointer'}`}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                                        <button 
                                                                            onClick={() => handleViewDetails(row.className)}
                                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
                                                                            title="Xem danh sách chi tiết"
                                                                        >
                                                                            <Eye size={18} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {step5SummaryData.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                                                        Không có lớp nào trong khối {selectedGrade} có dữ liệu học sinh cần rèn luyện.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 5: DETAIL VIEW (Tabs + Table) */}
                                        {step5View === 'detail' && (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                                    <button 
                                                        onClick={() => setStep5Tab('passed')} 
                                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg font-bold text-sm transition-all duration-200 shadow-sm
                                                            ${step5Tab === 'passed' 
                                                                ? 'bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-2' 
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}
                                                    >
                                                        <CheckCircle size={20} className={step5Tab === 'passed' ? 'text-white' : 'text-gray-500'} /> 
                                                        ĐƯỢC LÊN LỚP 
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${step5Tab === 'passed' ? 'bg-white text-green-700' : 'bg-gray-200 text-gray-600'}`}>{passedCount}</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setStep5Tab('failed')} 
                                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg font-bold text-sm transition-all duration-200 shadow-sm
                                                            ${step5Tab === 'failed' 
                                                                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-2' 
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}
                                                    >
                                                        <XCircle size={20} className={step5Tab === 'failed' ? 'text-white' : 'text-gray-500'} /> 
                                                        CHƯA ĐƯỢC LÊN LỚP 
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${step5Tab === 'failed' ? 'bg-white text-red-700' : 'bg-gray-200 text-gray-600'}`}>{failedCount}</span>
                                                    </button>
                                                </div>
                                                <div>
                                                    {step5Tab === 'passed' && <ReExamTable students={filteredStudents} activeTab={displayTab} filterMode="passed" showReasonInput={false} readOnlyReason={true} readOnlyInput={true} />}
                                                    {step5Tab === 'failed' && <ReExamTable students={filteredStudents} activeTab={displayTab} filterMode="failed" showReasonInput={true} readOnlyReason={true} readOnlyInput={true} />}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                        <ReExamTable 
                                            students={filteredStudents} 
                                            activeTab={displayTab} 
                                            onUpdateResult={handleUpdateResult}
                                            onUpdateSummaryReason={handleUpdateSummaryReason}
                                            filterMode={currentStep === 3 || currentStep === 4 ? "failed" : "all"}
                                            showReasonInput={currentStep === 3 || currentStep === 4}
                                            // Step 4: Always read-only for Reason input
                                            readOnlyReason={currentStep === 4 ? true : !isEditable}
                                            readOnlyInput={!isEditable} 
                                            enableSelection={isEditable && currentStep === 4}
                                            selectedIds={selectedStudentIds}
                                            onToggleSelect={handleToggleSelectStudent}
                                            onToggleSelectAll={handleToggleSelectAll}
                                            isAllSelected={isAllSelected}
                                            // FIX: Ignore Principal Approval in Step 3 so the list looks "Failed" even if approved later
                                            ignorePrincipalApproval={currentStep === 3}
                                            allowApprovedInFailedList={currentStep === 4}
                                        />
                                )}
                                {/* Text "Last updated" Removed from here */}
                                </>
                            )}
                        </div>

                        {/* UNIFIED FOOTER ACTIONS (Bottom) */}
                        {!showTeacherWaitingScreen && !showTeacherNotFinalizedScreen && !showPrincipalWaitingForTeacher && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                                {/* Left: Last Updated Text */}
                                <div className="text-xs text-gray-400 italic text-left">
                                    * Dữ liệu được cập nhật lần cuối: 10/06/2024 08:30
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-3">
                                    {currentStep > 1 && currentStep !== 5 && (
                                        <button 
                                            onClick={() => setCurrentStep(prev => prev - 1)} 
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-white hover:border-gray-400 transition-colors shadow-sm text-sm"
                                        >
                                            <ChevronLeft size={16} /> Quay lại
                                        </button>
                                    )}

                                    {/* TEACHER ACTIONS */}
                                    {currentUser.id === 'teacher' && (
                                        <>
                                            {/* EDIT MODE ACTIONS */}
                                            {isEditable && currentStep === 1 && (
                                                <button onClick={() => setCurrentStep(2)} disabled={!isStep1Complete} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-sm text-sm transition-colors ${isStep1Complete ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Tiếp tục <ChevronRight size={16} /></button>
                                            )}
                                            {isEditable && currentStep === 2 && (
                                                <button onClick={() => setCurrentStep(3)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">Xác nhận & Tiếp tục <ChevronRight size={16} /></button>
                                            )}
                                            {isEditable && currentStep === 3 && (
                                                <button onClick={handleSendToPrincipalClick} className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 transition-colors shadow-sm text-sm"><Send size={16} /> Gửi lên Hiệu trưởng</button>
                                            )}
                                            
                                            {/* READ ONLY MODE ACTIONS (View Next) */}
                                            {!isEditable && currentStep < 5 && (
                                                    <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-white hover:border-gray-400 transition-colors shadow-sm text-sm">Xem tiếp <ChevronRight size={16} /></button>
                                            )}
                                        </>
                                    )}

                                    {/* PRINCIPAL ACTIONS */}
                                    {currentUser.id === 'principal' && (
                                        <>
                                            {currentStep < 4 && (
                                                    <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-white hover:border-gray-400 transition-colors shadow-sm text-sm">Xem tiếp <ChevronRight size={16} /></button>
                                            )}
                                            
                                            {/* Principal Step 4 Actions */}
                                            {currentStep === 4 && isEditable && (
                                                <>
                                                    <button onClick={handleApproveSelected} className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm text-sm`}>
                                                        <CheckSquare size={16} /> Duyệt lên lớp
                                                    </button>
                                                    <button onClick={handlePrincipalStep4Continue} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
                                                        Tiếp tục <ChevronRight size={16} />
                                                    </button>
                                                </>
                                            )}

                                            {/* STEP 5 MASTER VIEW BATCH ACTION */}
                                            {currentStep === 5 && step5View === 'master' && (
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={handleBatchFinalize} 
                                                        disabled={selectedClassesForLock.length === 0 || processStatus !== 'APPROVED'}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors shadow-sm text-sm
                                                            ${(selectedClassesForLock.length === 0 || processStatus !== 'APPROVED')
                                                                ? 'bg-gray-300 text-white cursor-not-allowed' 
                                                                : 'bg-red-600 text-white hover:bg-red-700'}`}
                                                    >
                                                        <Lock size={16} /> 
                                                        {selectedClassesForLock.length > 0 ? `Chốt sổ (${selectedClassesForLock.length}) lớp đã chọn` : `Chốt sổ`}
                                                    </button>
                                                </div>
                                            )}

                                            {/* STEP 5 DETAIL VIEW ACTIONS (MOVED HERE) */}
                                            {currentStep === 5 && step5View === 'detail' && (
                                                <div className="flex items-center gap-3">
                                                     <button 
                                                        onClick={() => setStep5View('master')} 
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-white hover:border-gray-400 transition-colors shadow-sm text-sm"
                                                    >
                                                        <ChevronLeft size={16} /> Quay lại
                                                    </button>

                                                    <button 
                                                        onClick={handleFinalizeSingleClass}
                                                        disabled={finalizedClasses.includes(selectedClass) || processStatus !== 'APPROVED'}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors shadow-sm text-sm
                                                            ${(finalizedClasses.includes(selectedClass) || processStatus !== 'APPROVED')
                                                                ? 'bg-gray-300 text-white cursor-not-allowed' 
                                                                : 'bg-red-600 text-white hover:bg-red-700'}`}
                                                    >
                                                        <Lock size={16} />
                                                        {finalizedClasses.includes(selectedClass) ? `Đã chốt sổ lớp ${selectedClass}` : `Chốt sổ lớp ${selectedClass}`}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}