import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline, IoPeople } from "react-icons/io5";
import { HiHashtag } from "react-icons/hi";
import { TbUserFilled } from "react-icons/tb";
import { FaPaperPlane } from "react-icons/fa";

export const SearchBar = () => {
  const [keyword, setKeyword] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý sự kiện click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    if (e.key === "Enter") {
      handleSearch("post"); // Mặc định tìm bài viết nếu nhấn Enter
    }
  };

  return (
    <div className="relative w-fit mr-auto" ref={dropdownRef}>
      {/* 1.1 Input nhập từ khóa */}
      <div className="relative w-fit mr-auto" ref={dropdownRef}>
        {/* Search bar chính */}
        <div
          className="
            flex items-center rounded-2xl
            py-[2px] bg-white pr-2
            border-1 border-gray-300
            transition-all duration-300 ease-in-out
            focus-within:border-[#F295B6] group
            hover:border-[#F295B6]
          "
        >
          <input
            type="text"
            className="
              w-[180px] text-gray-700 placeholder-gray-400 text-base px-3
              bg-transparent outline-none
              transition-all duration-300
              focus:w-[420px]
            "
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
          />

          {/* Nút search với icon */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => handleSearch("post")}
            className="
              w-10 h-10
              flex items-center justify-center
              text-gray-500 hover:text-gray-700
              transition-all duration-200
            "
          >
            <IoSearchOutline
              size={20}
              className="
                transform
                transition-all duration-200
                group-hover:text-[#F295B6]
                group-hover:scale-120
                group-focus-within:text-[#F295B6]
                group-focus-within:scale-120
              "
            />
          </button>
        </div>
      </div>

      {/* 1.2 Dropdown Menu */}
      {showDropdown && keyword && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase">
            Tìm kiếm cho "{keyword}"
          </div>

          <button
            className="w-full text-left px-4 py-3 group
            hover:bg-[#FFEFF4] hover:text-[#BA2243] transition flex items-center"
            onClick={() => handleSearch("post")}
          >
            <FaPaperPlane
              className="mr-2 text-gray-300 group-hover:text-[#BA2243] transition-all duration-100"
              size={25}
            />{" "}
            Bài viết có chứa "{keyword}"
          </button>

          <button
            className="w-full text-left px-4 py-3 group
            hover:bg-[#FFEFF4] hover:text-[#BA2243] transition flex items-center"
            onClick={() => handleSearch("user")}
          >
            <TbUserFilled
              className="mr-2 text-gray-300 group-hover:text-[#BA2243] transition-all duration-100"
              size={25}
            />{" "}
            Người dùng tên "{keyword}"
          </button>

          <button
            className="w-full text-left px-4 py-3 group
            hover:bg-[#FFEFF4] hover:text-[#BA2243] transition flex items-center"
            onClick={() => handleSearch("community")}
          >
            <IoPeople
              className="mr-2 text-gray-300 group-hover:text-[#BA2243] transition-all duration-100"
              size={25}
            />{" "}
            Cộng đồng "{keyword}"
          </button>

          <button
            className="w-full text-left px-4 py-3 group
            hover:bg-[#FFEFF4] hover:text-[#BA2243] transition flex items-center"
            onClick={() => handleSearch("hashtag")}
          >
            <HiHashtag
              className="mr-2 text-gray-300 group-hover:text-[#BA2243] transition-all duration-100"
              size={25}
            />{" "}
            Hashtag "#
            {keyword}"
          </button>
        </div>
      )}
    </div>
  );
};
