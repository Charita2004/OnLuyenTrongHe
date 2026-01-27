import React from 'react';
import { Student } from '../types';

interface StudentTableProps {
  students: Student[];
  onToggleRegister: (id: number) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, onToggleRegister }) => {
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-blue-800">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 w-16">
              STT
            </th>
            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white w-24">
              Đăng ký
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white w-24">
              Tên lớp
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
              Họ tên
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white w-32">
              Ngày sinh
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
              Nội dung
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
              Lý do
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {students.map((student, index) => (
            <tr key={student.id} className="hover:bg-blue-50 transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {index + 1}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                <input
                  type="checkbox"
                  checked={student.register}
                  onChange={() => onToggleRegister(student.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {student.className}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-800">
                {student.fullName}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {student.dob}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-orange-600 font-medium">
                {student.content}
              </td>
              <td className={`px-3 py-4 text-sm ${student.isFailing ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                {student.reason}
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                Không tìm thấy dữ liệu học sinh
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};