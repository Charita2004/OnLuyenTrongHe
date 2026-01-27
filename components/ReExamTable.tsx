import React from 'react';
import { ArrowRight } from 'lucide-react';
import { StudentData, TabType, ReExamItem } from '../types';

interface ReExamTableProps {
  students: StudentData[];
  activeTab: TabType;
  onUpdateResult?: (studentId: string, itemId: string, value: string) => void;
  onUpdateSummaryReason?: (studentId: string, value: string) => void;
  filterMode?: 'all' | 'passed' | 'failed'; 
  showReasonInput?: boolean;
  readOnlyReason?: boolean;
  readOnlyInput?: boolean; // New prop for Step 1 Score Inputs
  enableSelection?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (studentId: string) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  ignorePrincipalApproval?: boolean; // New prop: If true, treats approved students as failed (for Step 3 view)
}

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
  ignorePrincipalApproval = false
}) => {
  const isSummary = activeTab === 'summary';

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-50 text-red-700 border border-red-200';
      case 'yellow': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'orange': return 'bg-orange-50 text-orange-700 border border-orange-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if a student passes based on scores/results only (Academic check)
  const checkAcademicPassStatus = (items: ReExamItem[]) => {
    const isFail = items.some(item => {
      const val = item.result?.trim() || ''; 
      
      // Numeric check for scores
      if (item.inputType === 'text') {
        const num = parseFloat(val);
        return isNaN(num) || num < 5; 
      }
      
      // Category check (T/Đ/C or T/H/C)
      return val === 'C' || val === '' || val === 'Chưa đạt' || val === 'Chưa hoàn thành';
    });
    return !isFail;
  };

  // Helper to format display text for New Result Badge
  const getNewResultDisplayText = (val: string | undefined, category: string) => {
    if (!val) return '---';
    
    switch(val) {
        case 'T': return 'T (Tốt)';
        case 'Đ': return 'Đ (Đạt)';
        case 'H': return 'H (Hoàn thành)';
        case 'C': return category === 'MÔN HỌC' ? 'C (Chưa hoàn thành)' : 'C (Cần cố gắng)';
        default: 
            // Return integer string if valid number
            const num = parseFloat(val);
            if (!isNaN(num)) return Math.round(num).toString();
            return val;
    }
  };

  // Helper to format Old Result (strip "Điểm " for cleaner look and round to integer)
  const getOldResultDisplayText = (val: string) => {
    const cleanVal = val.startsWith('Điểm ') ? val.replace('Điểm ', '') : val;
    const num = parseFloat(cleanVal);
    if (!isNaN(num)) {
        return Math.round(num).toString();
    }
    return cleanVal;
  };

  // Count visible students after filtering. 
  const visibleStudentsCount = students.filter(s => {
    const isAcademicPass = checkAcademicPassStatus(s.items);
    // Logic override: If ignoring approval, only look at academic pass
    const isFinalPass = isAcademicPass || (!ignorePrincipalApproval && s.isApprovedByPrincipal);

    if (filterMode === 'failed' && isFinalPass) return false;
    if (filterMode === 'passed' && !isFinalPass) return false;
    return true;
  }).length;

  if (visibleStudentsCount === 0) {
      // Custom empty state based on filter mode
      if (filterMode === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg bg-white">
                <div className="text-green-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Không có học sinh chưa đạt</h3>
                <p className="text-gray-500 mt-1">Tất cả học sinh đã đủ điều kiện lên lớp.</p>
            </div>
        );
      } else if (filterMode === 'passed') {
         return (
            <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg bg-white">
                <div className="text-gray-400 mb-3">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Danh sách trống</h3>
                <p className="text-gray-500 mt-1">Chưa có học sinh nào được xét lên lớp.</p>
            </div>
         );
      }
  }

  return (
    <div className="w-full overflow-x-auto border border-black rounded-lg shadow-sm bg-white relative">
      <div className="min-w-[1200px] md:min-w-full inline-block align-middle">
        <div className="overflow-hidden">
          <table className="min-w-full table-fixed">
            <thead className="bg-blue-800 border-b border-blue-900">
              <tr>
                {/* Column 0: Checkbox - Fixed 50px */}
                {enableSelection && (
                    <th 
                    scope="col" 
                    className="sticky top-0 z-20 bg-blue-800 px-1 py-4 text-center text-xs font-bold text-white uppercase tracking-wider w-[50px] min-w-[50px] border-r border-blue-700"
                    >
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={onToggleSelectAll}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer" 
                    />
                    </th>
                )}

                {/* Column 1: STT - Fixed 60px */}
                <th 
                  scope="col" 
                  className="sticky top-0 z-20 bg-blue-800 px-1 py-4 text-center text-xs font-bold text-white uppercase tracking-wider w-[60px] min-w-[60px] border-r border-blue-700"
                >
                  STT
                </th>
                {/* Column 2: INFO - Min 250px */}
                <th 
                  scope="col" 
                  className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[250px] min-w-[250px] border-r border-blue-700"
                >
                  THÔNG TIN HỌC SINH
                </th>
                {/* Column 3: Category - Min 140px */}
                <th 
                  scope="col" 
                  className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[140px] min-w-[140px] border-r border-blue-700"
                >
                  NHÓM NỘI DUNG
                </th>
                
                {/* Column 4: Details - Min 300px (Wide) */}
                <th 
                  scope="col" 
                  className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[300px] min-w-[300px] border-r border-blue-700"
                >
                  {isSummary ? 'KẾT QUẢ SAU RÈN LUYỆN LẠI' : 'CHI TIẾT & KẾT QUẢ CŨ'}
                </th>

                {/* Column 5: Input - Min 180px - Only show in Step 1 */}
                {!isSummary && (
                    <th 
                      scope="col" 
                      className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[180px] min-w-[180px] border-r border-blue-700"
                    >
                    CẬP NHẬT KẾT QUẢ
                    </th>
                )}

                {/* Column 6: Summary - Min 200px - Only show in Step 2, 3, 4, 5 */}
                {isSummary && (
                   <th 
                     scope="col" 
                     className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider w-[200px] min-w-[200px] border-r border-blue-700"
                   >
                    TỔNG HỢP KẾT QUẢ <br/> CUỐI CÙNG
                  </th>
                )}

                {/* Column 7: Reason - Min 250px - Only show in Step 3, 4, 5 */}
                {showReasonInput && (
                    <th 
                        scope="col" 
                        className="sticky top-0 z-20 bg-blue-800 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[250px] min-w-[250px] border-r border-blue-700"
                    >
                        LÝ DO
                    </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white">
              {students.map((student, studentIndex) => {
                // Check ACADEMIC status
                const isAcademicPass = checkAcademicPassStatus(student.items);
                // Final Pass Status includes Principal Override, respecting the ignore flag
                const isFinalPass = isAcademicPass || (!ignorePrincipalApproval && student.isApprovedByPrincipal);

                // Filtering Logic
                if (filterMode === 'failed' && isFinalPass) return null;
                if (filterMode === 'passed' && !isFinalPass) return null;

                // Group items by category
                const groupedItems: Record<string, ReExamItem[]> = {};
                student.items.forEach(item => {
                    if (!groupedItems[item.category]) {
                        groupedItems[item.category] = [];
                    }
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

                                let borderClass = "border-b border-dashed border-gray-400"; 
                                if (isLastItemOfStudent) {
                                    borderClass = "border-b-2 border-black";
                                } else if (isLastItemOfCategory) {
                                    borderClass = "border-b border-black";
                                }

                                return (
                                    <tr key={item.id} className={`${borderClass} hover:bg-gray-50 transition-colors`}>
                                        
                                        {/* Column 0: Checkbox */}
                                        {enableSelection && isFirstItemOfStudent && (
                                            <td
                                                className="px-1 py-4 align-middle text-center border-r border-black bg-white"
                                                rowSpan={totalRowsForStudent}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(student.id)}
                                                    disabled={student.isApprovedByPrincipal}
                                                    onChange={() => onToggleSelect && onToggleSelect(student.id)}
                                                    className={`w-4 h-4 rounded border-gray-300 focus:ring-blue-500
                                                        ${student.isApprovedByPrincipal 
                                                            ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                                            : 'text-blue-600 cursor-pointer'}`}
                                                />
                                            </td>
                                        )}

                                        {/* Column 1: STT */}
                                        {isFirstItemOfStudent && (
                                            <td 
                                                className="px-1 py-4 align-middle text-center border-r border-black bg-white"
                                                rowSpan={totalRowsForStudent}
                                            >
                                                <span className="text-gray-900 font-bold text-sm">
                                                    {studentIndex + 1}
                                                </span>
                                            </td>
                                        )}

                                        {/* Column 2: Info */}
                                        {isFirstItemOfStudent && (
                                            <td 
                                                className="px-4 py-4 align-middle border-r border-black bg-white"
                                                rowSpan={totalRowsForStudent}
                                            >
                                                <div className="flex flex-col gap-1 text-sm text-left">
                                                    <span className="font-bold text-gray-900 text-base">{student.fullName}</span>
                                                    <span className="text-gray-500 text-xs font-mono">Mã HS: {student.code}</span>
                                                    <span className="text-gray-500">Lớp: {student.className}</span>
                                                </div>
                                            </td>
                                        )}

                                        {/* Column 3: Category */}
                                        {isFirstItemOfCategory && (
                                            <td
                                                className="px-4 py-4 align-middle text-left border-r border-black bg-white"
                                                rowSpan={items.length}
                                            >
                                                <span className="text-sm font-bold text-gray-900">
                                                    {category}
                                                </span>
                                            </td>
                                        )}

                                        {/* Column 4: Details */}
                                        <td className="px-4 py-4 align-middle border-r border-black bg-white">
                                            {isSummary ? (
                                                // STEP 2/3/4/5 LAYOUT: Comparison View
                                                <div className="flex flex-col items-start gap-2">
                                                    {/* Line 1: Subject Name */}
                                                    <span className="text-sm font-bold text-gray-900">{item.subjectName}</span>
                                                    
                                                    {/* Line 2: Comparison Badges */}
                                                    <div className="flex items-center gap-3">
                                                        {/* Component A: Old Result */}
                                                        <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold rounded-md border bg-red-50 text-red-500 border-red-200 whitespace-nowrap">
                                                            {getOldResultDisplayText(item.currentScore)}
                                                        </span>

                                                        {/* Component B: Arrow */}
                                                        <ArrowRight size={16} className="text-gray-400" />

                                                        {/* Component C: New Result */}
                                                        <span className="inline-flex items-center justify-center px-3 py-1 text-[13px] font-semibold rounded-md border bg-blue-50 text-blue-600 border-blue-200 whitespace-nowrap">
                                                            {getNewResultDisplayText(item.result, item.category)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                // STEP 1 LAYOUT: Subject + Old Score Badge
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-800">{item.subjectName}</span>
                                                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${getBadgeColor(item.badgeColor)}`}>
                                                        {item.currentScore}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Column 5: Input Result (Step 1) */}
                                        {!isSummary && (
                                            <td 
                                                className="px-4 py-4 align-middle bg-white border-r border-black"
                                            >
                                                {item.inputType === 'text' ? (
                                                    <div className="relative">
                                                        <input 
                                                            type="number"
                                                            step="any"
                                                            disabled={readOnlyInput}
                                                            value={item.result || ''}
                                                            onChange={(e) => onUpdateResult && onUpdateResult(student.id, item.id, e.target.value)}
                                                            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                                            placeholder={readOnlyInput ? "" : "Nhập điểm..."}
                                                            className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-gray-50 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                                [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield]
                                                                ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                                                        />
                                                        {!readOnlyInput && <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">/ 10</span>}
                                                    </div>
                                                ) : (
                                                    <select 
                                                    disabled={readOnlyInput}
                                                    value={item.result || ''}
                                                    onChange={(e) => onUpdateResult && onUpdateResult(student.id, item.id, e.target.value)}
                                                    className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                                        ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'cursor-pointer hover:border-blue-400'}`}
                                                    >
                                                        <option value="">-- Chọn --</option>
                                                        {item.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                )}
                                            </td>
                                        )}

                                        {/* Column 6: Final Result (Step 2, 3, 4, 5) */}
                                        {isSummary && isFirstItemOfStudent && (
                                            <td 
                                                className="px-4 py-4 align-middle text-center bg-white border-r border-black"
                                                rowSpan={totalRowsForStudent}
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    {isFinalPass ? (
                                                        <>
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                                ĐƯỢC LÊN LỚP
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {student.isApprovedByPrincipal && !ignorePrincipalApproval ? 'Hiệu trưởng duyệt' : 'Hoàn thành rèn luyện'}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                                CHƯA ĐƯỢC LÊN LỚP
                                                            </span>
                                                            <span className="text-xs text-gray-500">Cần xem xét lại</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                        {/* Column 7: Reason Input (Step 3, 4, 5) */}
                                        {showReasonInput && isFirstItemOfStudent && (
                                            <td
                                                className="px-4 py-4 align-middle bg-white border-r border-black"
                                                rowSpan={totalRowsForStudent}
                                            >
                                                 <textarea
                                                    disabled={readOnlyReason}
                                                    className={`w-full h-24 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none 
                                                        ${readOnlyReason ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white'}`}
                                                    placeholder={readOnlyReason ? "" : "Nhập lý do không đủ kiện sau rèn luyện hè..."}
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