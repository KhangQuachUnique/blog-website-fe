import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchBar = () => {
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý sự kiện click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Hàm điều hướng khi người dùng chọn loại tìm kiếm (1.3)
  const handleSearch = (type: string) => {
    if (!keyword.trim()) return;
    setShowDropdown(false);
    // Chuyển hướng sang trang kết quả với query params
    navigate(`/search?q=${encodeURIComponent(keyword)}&type=${type}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch('post'); // Mặc định tìm bài viết nếu nhấn Enter
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* 1.1 Input nhập từ khóa */}
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
        <span className="text-gray-500 mr-2">🔍</span>
        <input
          type="text"
          className="bg-transparent border-none outline-none w-full text-sm"
          placeholder="Searching on Blog..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* 1.2 Dropdown Menu */}
      {showDropdown && keyword && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50 uppercase">
            Tìm kiếm cho "{keyword}"
          </div>
          
          <button 
            className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition flex items-center"
            onClick={() => handleSearch('post')}
          >
            📝 Bài viết có chứa "{keyword}"
          </button>
          
          <button 
            className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition flex items-center"
            onClick={() => handleSearch('user')}
          >
            👤 Người dùng tên "{keyword}"
          </button>
          
          <button 
            className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition flex items-center"
            onClick={() => handleSearch('community')}
          >
            👨‍👩‍👧‍👦 Cộng đồng "{keyword}"
          </button>
          
           <button 
            className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition flex items-center"
            onClick={() => handleSearch('hashtag')}
          >
            #️⃣ Hashtag "#{keyword}"
          </button>
        </div>
      )}
    </div>
  );
};
import { CiSearch } from "react-icons/ci";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  iconSize?: number;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder,
  icon,
  iconSize,
}: SearchBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-xl bg-white/40 gap-2 w-[300px] focus-within:border-[#F295B6] transition-colors duration-200">
      <input
        type="text"
        className="outline-none w-full text-md search-input"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {icon || <CiSearch fontSize={iconSize || 24} />}
    </div>
  );
};
