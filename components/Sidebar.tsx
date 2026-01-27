import React from 'react';
import { 
  Calendar, 
  FileText, 
  Users, 
  BookOpen, 
  BarChart2, 
  ClipboardList,
  GraduationCap
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-[#0f172a] text-white flex flex-col h-full flex-shrink-0 border-r border-gray-800">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700 bg-[#0f172a]">
        <div className="flex items-center gap-2 font-bold text-lg tracking-wider">
           <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0f172a]">
             <GraduationCap size={20} />
           </div>
           <span>VIET NAM</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        
        {/* Group: ĐỊNH KỲ */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
            <Calendar size={14} />
            ĐỊNH KỲ
          </h3>
          <div className="space-y-1">
            <NavItem icon={<FileText size={18} />} label="Nhập/Xuất điểm hàng loạt" />
            <NavItem icon={<BookOpen size={18} />} label="Quản lý theo bộ môn" />
            <NavItem icon={<Users size={18} />} label="Quản lý theo lớp học" />
            <NavItem 
              icon={<ClipboardList size={18} />} 
              label="Ôn luyện lại trong hè" 
              isActive={true} 
            />
          </div>
        </div>

        {/* Group: HÀNG THÁNG */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
            <BarChart2 size={14} />
            HÀNG THÁNG
          </h3>
          <div className="space-y-1">
            <NavItem icon={<FileText size={18} />} label="Nhận xét đánh giá thường xuyên" />
          </div>
        </div>

      </div>

      {/* Footer / User Profile (Optional) */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
            GV
          </div>
          <div className="text-sm">
            <div className="font-medium">Giáo viên CN</div>
            <div className="text-gray-400 text-xs">Tiểu học</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for Nav Items
const NavItem = ({ icon, label, isActive = false }: { icon: React.ReactNode, label: string, isActive?: boolean }) => {
  return (
    <button 
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
};