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
    <div className="relative w-full max-w-md mr-auto" ref={dropdownRef}>
      {/* 1.1 Input nhập từ khóa */}
      <div className="relative">
        <input
          type="text"
          className="w-full rounded-full border border-gray-200 bg-white px-6 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Search..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
        />

        {/* Search button on the right */}
        <button
          type="button"
          aria-label="Search"
          onClick={() => handleSearch('post')}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </button>
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
