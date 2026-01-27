import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export const InstructionAccordion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm mb-6 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center text-blue-800 font-medium">
          <Info className="w-5 h-5 mr-3 text-blue-600" />
          <span>ℹ️ Hướng dẫn quy trình xét duyệt (Theo thông tư 27) - Nhấn để xem chi tiết</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-blue-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 bg-white border-t border-blue-100 text-sm text-gray-700 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="font-semibold text-gray-900">Quy định về xét hoàn thành chương trình lớp học:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Nhấn nút <span className="font-bold text-blue-600">"Tìm kiếm"</span> để hệ thống tự động lọc danh sách học sinh đủ điều kiện rèn luyện trong hè hoặc kiểm tra lại.</li>
            <li>Hệ thống dựa trên kết quả đánh giá định kỳ cuối năm học theo <span className="font-bold">Thông tư 27/2020/TT-BGDĐT</span>.</li>
            <li>Giáo viên chủ nhiệm rà soát, tích chọn học sinh và nhấn <span className="font-bold text-green-600">"Cập nhật đăng ký"</span> để hoàn tất.</li>
            <li>Học sinh chưa hoàn thành môn học hoặc năng lực/phẩm chất cần được lập kế hoạch rèn luyện trong hè.</li>
          </ul>
        </div>
      )}
    </div>
  );
};