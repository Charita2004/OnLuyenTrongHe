import React from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  Play
} from 'lucide-react';
import { StudentData, ReExamItem } from '../types';

interface InitializationScreenProps {
  students: StudentData[];
  isSyncing: boolean;
  onSync: () => void;
  onStart: () => void;
}

export const InitializationScreen: React.FC<InitializationScreenProps> = ({
  students,
  isSyncing,
  onSync,
  onStart
}) => {

  const groupItems = (items: ReExamItem[]) => {
    const groups: Record<string, ReExamItem[]> = {};
    items.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  };

  const currentClassName = students.length > 0 ? students[0].className : '5A1';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Alert Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
        <div className="bg-amber-100 p-2 rounded-full shrink-0">
             <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <div>
            <h3 className="text-amber-800 font-bold mb-1 text-lg">Lưu ý quan trọng</h3>
            <p className="text-amber-800 text-sm leading-relaxed opacity-90">
                Hệ thống đã tự động tổng hợp danh sách học sinh chưa hoàn thành chương trình sau khi chốt sổ Cuối năm. 
                Nếu có thay đổi điểm hay có thao tác hủy chốt sổ, vui lòng kiểm tra danh sách và nhấn <b>"Lọc lại danh sách"</b> để lấy dữ liệu mới nhất. 
                Sau khi nhấn nút <b>"Chốt danh sách & Bắt đầu"</b>, Thầy Cô sẽ không thể thực hiện chỉnh sửa điểm trong năm học nữa để đảm bảo tính nhất quán dữ liệu cho quá trình rèn luyện lại.
            </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-black overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-black bg-white flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Danh sách rèn luyện hè - Lớp {currentClassName}
                <span className="text-xs font-normal text-gray-500">(Dữ liệu xem trước)</span>
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium border border-gray-200">
                Read-only
            </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto min-h-[300px]">
             <table className="min-w-full table-fixed border-collapse">
                <thead className="bg-blue-800 text-white">
                    <tr>
                        <th className="w-[50px] py-3 px-2 text-center text-xs font-bold uppercase border-r border-blue-700">STT</th>
                        <th className="w-[250px] py-3 px-4 text-left text-xs font-bold uppercase border-r border-blue-700">Thông tin học sinh</th>
                        <th className="w-[200px] py-3 px-4 text-left text-xs font-bold uppercase border-r border-blue-700">Nhóm nội dung</th>
                        <th className="py-3 px-4 text-left text-xs font-bold uppercase">Chi tiết & Kết quả cũ</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {students.map((student, sIndex) => {
                        const groups = groupItems(student.items);
                        const categories = Object.keys(groups);
                        const totalRows = student.items.length;
                        
                        let currentStudentRow = 0;

                        return (
                            <React.Fragment key={student.id}>
                                {categories.map((category, catIndex) => {
                                    const items = groups[category];
                                    const isLastCategory = catIndex === categories.length - 1;

                                    return items.map((item, iIndex) => {
                                        const isFirstOfStudent = currentStudentRow === 0;
                                        const isFirstOfCategory = iIndex === 0;
                                        const isLastOfCategory = iIndex === items.length - 1;
                                        const isLastOfStudent = isLastCategory && isLastOfCategory;
                                        currentStudentRow++;

                                        let borderClass = "border-b border-dashed border-gray-400";
                                        if (isLastOfStudent) borderClass = "border-b-2 border-black";
                                        else if (isLastOfCategory) borderClass = "border-b border-black";

                                        return (
                                            <tr key={item.id} className={`hover:bg-gray-50 transition-colors text-sm ${borderClass}`}>
                                                {isFirstOfStudent && (
                                                    <td className="py-3 px-2 text-center font-medium text-gray-900 border-r border-black align-top pt-4" rowSpan={totalRows}>
                                                        {sIndex + 1}
                                                    </td>
                                                )}

                                                {isFirstOfStudent && (
                                                    <td className="py-3 px-4 border-r border-black align-top pt-4" rowSpan={totalRows}>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900 text-base">{student.fullName}</span>
                                                            <span className="text-gray-500 text-xs font-mono mt-0.5">Mã: {student.code}</span>
                                                            <span className="text-gray-500 text-xs mt-0.5">Lớp: {student.className}</span>
                                                        </div>
                                                    </td>
                                                )}

                                                {isFirstOfCategory && (
                                                    <td className="py-3 px-4 font-semibold text-gray-700 border-r border-black align-top pt-4 bg-gray-50/50" rowSpan={items.length}>
                                                        {category}
                                                    </td>
                                                )}

                                                <td className="py-3 px-4 align-middle border-black">
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-bold text-gray-800 text-sm">{item.subjectName}</span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border whitespace-pre-line ${
                                                            item.badgeColor === 'red' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                            item.badgeColor === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                            'bg-orange-50 text-orange-700 border-orange-200'
                                                        }`}>
                                                            {item.currentScore}
                                                        </span>
                                                    </div>
                                                </td>
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

        {/* Footer */}
        <div className="bg-gray-50 border-t border-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg">
             <div className="text-xs text-gray-500 italic flex items-center gap-1">
                <RotateCcw size={12} />
                Dữ liệu được lấy từ Sổ điểm lúc: 10/01/2026 08:00
             </div>

             <div className="flex items-center gap-3">
                <button 
                    onClick={onSync}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-white hover:border-gray-400 hover:shadow-sm transition-all text-sm
                        ${isSyncing ? 'opacity-70 cursor-wait' : ''}`}
                >
                    <RotateCcw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Đang lọc lại...' : 'Lọc lại danh sách'}
                </button>
                <button 
                    onClick={onStart}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200 text-sm"
                >
                    <Play size={16} fill="currentColor" />
                    Chốt danh sách & Bắt đầu
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};