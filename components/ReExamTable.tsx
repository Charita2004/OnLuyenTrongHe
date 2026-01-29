import React from 'react';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { StudentData, TabType, ReExamItem } from '../types';

interface ReExamTableProps {
  students: StudentData[];
  activeTab: TabType;
  onUpdateResult?: (studentId: string, itemId: string, value: string) => void;
  onUpdateSummaryReason?: (studentId: string, value: string) => void;
  filterMode?: 'all' | 'passed' | 'failed'; 
  showReasonInput?: boolean;
  readOnlyReason?: boolean;
  readOnlyInput?: boolean;
  enableSelection?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (studentId: string) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  ignorePrincipalApproval?: boolean;
  allowApprovedInFailedList?: boolean; // [NEW 1] Thêm prop mới
}

// Helper to clean raw data strings
const cleanValue = (val: string | undefined): string => {
    if (!val) return '---';
    let cleaned = val.replace(/^Điểm\s+/, '');
    cleaned = cleaned.replace(/^Mức\s+/, '');
    cleaned = cleaned.replace(/\s*\(.*\)$/, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && isFinite(num)) {
       if (num.toString() === cleaned || num.toString() === cleaned.trim()) {
           return Math.round(num).toString();
       }
    }
    return cleaned.trim();
};

// Reverted CleanBadge to standard style (Giữ nguyên như code cũ của bạn)
const CleanBadge = ({ label, value, color = 'gray' }: { label: any, value: string, color?: 'red' | 'blue' | 'gray' }) => {
    const bgClass = color === 'red' ? 'bg-red-50 border-red-200 text-red-700' :
                    color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    'bg-gray-100 border-gray-200 text-gray-700';
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded border ${bgClass} text-xs font-medium`}>
            <span className="opacity-70 uppercase text-[10px] tracking-wide">{label}</span>
            <span className="font-bold">{value}</span>
        </span>
    );
};

export const ReExamTable: React.FC<ReExamTableProps> = ({ 
  students, 
  activeTab, 
  onUpdateResult, 
  onUpdateSummaryReason, 
  filterMode = 'all',
  showReasonInput = false,
  readOnlyReason = false,
  readOnlyInput = false, 
  enableSelection = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected = false,
  ignorePrincipalApproval = false,
  allowApprovedInFailedList = false // [NEW 2] Default value
}) => {
  const isSummary = activeTab === 'summary';

  const checkAcademicPassStatus = (items: ReExamItem[]) => {
    const isFail = items.some(item => {
      const val = item.result?.trim() || ''; 
      if (item.hasDoubleAuth) {
         const parts = val.split('|');
         const level = parts[0];
         const scoreStr = parts[1];
         const score = parseFloat(scoreStr);
         if (level === 'C' || isNaN(score) || score < 5) return true;
         if (!level || !scoreStr) return true;
         return false;
      }
      if (item.inputType === 'text') {
        const num = parseFloat(val);
        return isNaN(num) || num < 5; 
      }
      return val === 'C' || val === '' || val === 'Chưa đạt' || val === 'Chưa hoàn thành';
    });
    return !isFail;
  };

  // [NEW 3] Cập nhật logic đếm số lượng hiển thị
  const visibleStudentsCount = students.filter(s => {
    const isAcademicPass = checkAcademicPassStatus(s.items);
    const isFinalPass = isAcademicPass || (!ignorePrincipalApproval && s.isApprovedByPrincipal);
    
    // Filtering Logic Mới
    if (filterMode === 'failed') {
        // Nếu học sinh thật sự đậu về mặt học thuật, không bao giờ hiện ở danh sách Failed
        if (isAcademicPass) return false;

        // Nếu học sinh rớt học thuật nhưng được duyệt (isFinalPass = true)
        // Mặc định ẩn, trừ khi allowApprovedInFailedList = true
        if (isFinalPass && !allowApprovedInFailedList) return false;
        
        return true;
    }
    
    if (filterMode === 'passed' && !isFinalPass) return false;
    return true;
  }).length;

  const parseDoubleAuthOld = (raw: string) => {
      const parts = raw.split('\n');
      const rawLevel = parts.find(p => p.includes('Mức')) || parts[0] || '';
      const rawScore = parts.find(p => p.includes('Điểm')) || parts[1] || '';
      return {
          level: cleanValue(rawLevel),
          score: cleanValue(rawScore)
      };
  };

  const parseDoubleAuthNew = (raw: string | undefined) => {
      const parts = (raw || '').split('|');
      return {
          level: parts[0] || '',
          score: parts[1] || ''
      };
  };

  const updateDoubleAuth = (studentId: string, itemId: string, type: 'level' | 'score', val: string, currentFull: string | undefined) => {
      const current = parseDoubleAuthNew(currentFull);
      let newVal = '';
      if (type === 'level') {
          newVal = `${val}|${current.score}`;
      } else {
          newVal = `${current.level}|${val}`;
      }
      if (onUpdateResult) {
          onUpdateResult(studentId, itemId, newVal);
      }
  };

  if (visibleStudentsCount === 0) {
      if (filterMode === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg bg-white">
                <div className="text-green-500 mb-3"><CheckCircle size={48} /></div>
                <h3 className="text-lg font-medium text-gray-900">Không có học sinh chưa đạt</h3>
                <p className="text-gray-500 mt-1">Tất cả học sinh đã đủ điều kiện lên lớp.</p>
            </div>
        );
      } else if (filterMode === 'passed') {
         return (
            <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg bg-white">
                <div className="text-gray-400 mb-3"><XCircle size={48} /></div>
                <h3 className="text-lg font-medium text-gray-900">Danh sách trống</h3>
                <p className="text-gray-500 mt-1">Chưa có học sinh nào được xét lên lớp.</p>
            </div>
         );
      }
  }

  const ArrowIcon = () => <ArrowRight size={14} className="text-gray-400 shrink-0" />;

  return (
    <div className="w-full overflow-x-auto border border-black rounded-lg shadow-sm bg-white relative">
      <div className="min-w-[1200px] md:min-w-full inline-block align-middle">
        <div className="overflow-hidden">
          <table className="min-w-full table-fixed">
            <thead className="bg-blue-800 border-b border-blue-900">
              <tr>
                {enableSelection && (
                    <th className="sticky top-0 z-20 bg-blue-800 px-1 py-4 text-center w-[50px] border-r border-blue-700">
                        <input type="checkbox" checked={isAllSelected} onChange={onToggleSelectAll} className="rounded text-blue-600 focus:ring-0 cursor-pointer" />
                    </th>
                )}
                <th className="sticky top-0 z-20 bg-blue-800 px-1 py-4 text-center text-xs font-bold text-white uppercase w-[60px] border-r border-blue-700">STT</th>
                <th className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase w-[250px] border-r border-blue-700">THÔNG TIN HỌC SINH</th>
                <th className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase w-[140px] border-r border-blue-700">NHÓM NỘI DUNG</th>
                <th className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase w-[300px] border-r border-blue-700">
                  {isSummary ? 'KẾT QUẢ SAU RÈN LUYỆN LẠI' : 'CHI TIẾT & KẾT QUẢ CŨ'}
                </th>
                {!isSummary && <th className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase w-[180px] border-r border-blue-700">CẬP NHẬT KẾT QUẢ</th>}
                {isSummary && <th className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-center text-xs font-bold text-white uppercase w-[200px] border-r border-blue-700">TỔNG HỢP KẾT QUẢ <br/> CUỐI CÙNG</th>}
                {showReasonInput && <th className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase w-[250px] border-r border-blue-700">LÝ DO</th>}
              </tr>
            </thead>
            <tbody className="bg-white">
              {students.map((student, studentIndex) => {
                const isAcademicPass = checkAcademicPassStatus(student.items);
                const isFinalPass = isAcademicPass || (!ignorePrincipalApproval && student.isApprovedByPrincipal);

                // [NEW 4] Cập nhật logic lọc trong vòng lặp render
                if (filterMode === 'failed') {
                    if (isAcademicPass) return null;
                    if (isFinalPass && !allowApprovedInFailedList) return null;
                } else if (filterMode === 'passed' && !isFinalPass) {
                    return null;
                }

                const groupedItems: Record<string, ReExamItem[]> = {};
                student.items.forEach(item => {
                    if (!groupedItems[item.category]) groupedItems[item.category] = [];
                    groupedItems[item.category].push(item);
                });

                const categories = Object.keys(groupedItems);
                let totalRowsForStudent = 0;
                categories.forEach(cat => totalRowsForStudent += groupedItems[cat].length);
                if (totalRowsForStudent === 0) return null;

                let currentRowIndex = 0;

                return (
                    <React.Fragment key={student.id}>
                        {categories.map((category, catIndex) => {
                            const items = groupedItems[category];
                            const isLastCategory = catIndex === categories.length - 1;

                            return items.map((item, itemIndex) => {
                                const isFirstItemOfStudent = currentRowIndex === 0;
                                const isFirstItemOfCategory = itemIndex === 0;
                                const isLastItemOfCategory = itemIndex === items.length - 1;
                                const isLastItemOfStudent = isLastCategory && isLastItemOfCategory;
                                currentRowIndex++;

                                // BORDER LOGIC: 
                                // - Dashed separator inside a category
                                // - Solid black separator between categories or students
                                let borderClass = "border-b border-dashed border-gray-400"; 
                                if (isLastItemOfStudent) borderClass = "border-b-2 border-black";
                                else if (isLastItemOfCategory) borderClass = "border-b border-black";

                                const oldDouble = parseDoubleAuthOld(item.currentScore);
                                const newDouble = parseDoubleAuthNew(item.result);
                                const singleOld = cleanValue(item.currentScore);
                                const singleNew = cleanValue(item.result);
                                const singleLabel = item.inputType === 'text' ? 'ĐIỂM' : 'MỨC';

                                return (
                                    <tr key={item.id} className={`${borderClass} hover:bg-gray-50 transition-colors`}>
                                        
                                        {enableSelection && isFirstItemOfStudent && (
                                            <td className="px-1 py-4 align-middle text-center border-r border-black bg-white" rowSpan={totalRowsForStudent}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(student.id)}
                                                    disabled={student.isApprovedByPrincipal}
                                                    onChange={() => onToggleSelect && onToggleSelect(student.id)}
                                                    className={`w-4 h-4 rounded border-gray-300 focus:ring-blue-500 ${student.isApprovedByPrincipal ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-600 cursor-pointer'}`}
                                                />
                                            </td>
                                        )}

                                        {isFirstItemOfStudent && (
                                            <td className="px-1 py-4 align-middle text-center border-r border-black bg-white" rowSpan={totalRowsForStudent}>
                                                <span className="text-gray-900 font-bold text-sm">{studentIndex + 1}</span>
                                            </td>
                                        )}

                                        {isFirstItemOfStudent && (
                                            <td className="px-4 py-4 align-middle border-r border-black bg-white" rowSpan={totalRowsForStudent}>
                                                <div className="flex flex-col gap-1 text-sm text-left">
                                                    <span className="font-bold text-gray-900 text-base">{student.fullName}</span>
                                                    <span className="text-gray-500 text-xs font-mono">Mã HS: {student.code}</span>
                                                    <span className="text-gray-500">Lớp: {student.className}</span>
                                                </div>
                                            </td>
                                        )}

                                        {isFirstItemOfCategory && (
                                            <td className="px-4 py-4 align-middle text-left border-r border-black bg-white" rowSpan={items.length}>
                                                <span className="text-sm font-bold text-gray-900">{category}</span>
                                            </td>
                                        )}

                                    <td className="px-4 py-4 align-middle border-r border-black bg-white">
                                        {!isSummary ? (
                                            // Step 1 Layout: Flex row justify-between
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-sm font-bold text-gray-900">{item.subjectName}</span>
                                                
                                                {item.hasDoubleAuth ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <CleanBadge 
                                                            label={<span className="font-bold">MỨC</span>} 
                                                            value={oldDouble.level} 
                                                            color="red" 
                                                        />
                                                        <CleanBadge 
                                                            label={<span className="font-bold">ĐIỂM</span>} 
                                                            value={oldDouble.score} 
                                                            color="red" 
                                                        />
                                                    </div>
                                                ) : (
                                                    <CleanBadge 
                                                        label={<span className="font-bold">{singleLabel}</span>} 
                                                        value={singleOld} 
                                                        color="red" 
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            // Step 2+ Layout: Stacked for comparison
                                            <div className="flex flex-col items-start gap-2">
                                                <span className="text-sm font-bold text-gray-900">{item.subjectName}</span>
                                                
                                                {item.hasDoubleAuth ? (
                                                    <div className="flex flex-col gap-1.5 w-full">
                                                        <div className="flex items-center gap-2">
                                                            <CleanBadge 
                                                                label={<span className="font-bold">MỨC</span>} 
                                                                value={oldDouble.level} 
                                                                color="red" 
                                                            />
                                                            <ArrowIcon />
                                                            <CleanBadge  
                                                            label={<span className="font-bold">MỨC</span>}
                                                            value={newDouble.level || '---'} 
                                                            color="blue" />
                                                          

                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CleanBadge 
                                                                label={<span className="font-bold">ĐIỂM</span>} 
                                                                value={oldDouble.score} 
                                                                color="red" 
                                                            />
                                                            <ArrowIcon />
                                                            <CleanBadge label={<span className="font-bold">ĐIỂM</span>} value={newDouble.score || '---'} color="blue" />
                                                            

                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <CleanBadge 
                                                            label={<span className="font-bold">{singleLabel}</span>} 
                                                            value={singleOld} 
                                                            color="red" 
                                                        />
                                                        <ArrowIcon />
                                                        <CleanBadge 
                                                        label={<span className="font-bold">{singleLabel}</span>} 
                                                        value={singleNew || '---'} 
                                                        color="blue" />
                                                        
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>

                                        {!isSummary && (
                                            <td className="px-4 py-4 align-middle bg-white border-r border-black">
                                                {item.hasDoubleAuth ? (
                                                    <div className="flex flex-col gap-2">
                                                        <select 
                                                            disabled={readOnlyInput}
                                                            value={newDouble.level || ''}
                                                            onChange={(e) => updateDoubleAuth(student.id, item.id, 'level', e.target.value, item.result)}
                                                            className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'cursor-pointer hover:border-blue-400'}`}
                                                        >
                                                            <option value="">-- Chọn --</option>
                                                            {['T', 'H', 'C'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                        <div className="relative">
                                                            <input 
                                                                type="number"
                                                                step="any"
                                                                disabled={readOnlyInput}
                                                                value={newDouble.score || ''}
                                                                onChange={(e) => updateDoubleAuth(student.id, item.id, 'score', e.target.value, item.result)}
                                                                placeholder={readOnlyInput ? "" : "Điểm..."}
                                                                className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-gray-50 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                                                            />
                                                            {!readOnlyInput && <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">/ 10</span>}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    item.inputType === 'text' ? (
                                                        <div className="relative">
                                                            <input 
                                                                type="number"
                                                                step="any"
                                                                disabled={readOnlyInput}
                                                                value={item.result || ''}
                                                                onChange={(e) => onUpdateResult && onUpdateResult(student.id, item.id, e.target.value)}
                                                                placeholder={readOnlyInput ? "" : "Nhập điểm..."}
                                                                className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-gray-50 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                                                            />
                                                            {!readOnlyInput && <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">/ 10</span>}
                                                        </div>
                                                    ) : (
                                                        <select 
                                                            disabled={readOnlyInput}
                                                            value={item.result || ''}
                                                            onChange={(e) => onUpdateResult && onUpdateResult(student.id, item.id, e.target.value)}
                                                            className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'cursor-pointer hover:border-blue-400'}`}
                                                        >
                                                            <option value="">-- Chọn --</option>
                                                            {item.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    )
                                                )}
                                            </td>
                                        )}

                                        {isSummary && isFirstItemOfStudent && (
                                            <td className="px-4 py-4 align-middle text-center bg-white border-r border-black" rowSpan={totalRowsForStudent}>
                                                <div className="flex flex-col items-center gap-2">
                                                    {isFinalPass ? (
                                                        <>
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">ĐƯỢC LÊN LỚP</span>
                                                            <span className="text-xs text-gray-500">{student.isApprovedByPrincipal && !ignorePrincipalApproval ? 'HT Duyệt' : 'Hoàn thành'}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">CHƯA ĐƯỢC LÊN LỚP</span>
                                                            <span className="text-xs text-gray-500">Thi lại</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                        {showReasonInput && isFirstItemOfStudent && (
                                            <td className="px-4 py-4 align-middle bg-white border-r border-black" rowSpan={totalRowsForStudent}>
                                                 <textarea
                                                    disabled={readOnlyReason}
                                                    className={`w-full h-24 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none ${readOnlyReason ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white'}`}
                                                    placeholder={readOnlyReason ? "" : "Nhập lý do..."}
                                                    value={student.summary.finalReason || ''}
                                                    onChange={(e) => !readOnlyReason && onUpdateSummaryReason && onUpdateSummaryReason(student.id, e.target.value)}
                                                 ></textarea>
                                            </td>
                                        )}

                                    </tr>
                                );
                            });
                        })}
                    </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};