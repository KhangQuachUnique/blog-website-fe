import { HiOutlineX } from "react-icons/hi";
import { FiPlusCircle } from "react-icons/fi";

import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useLoginRequired } from "../../hooks/useLoginRequired";

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SideBarProps {
  navLinks: NavLink[];
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const SideBar = ({ navLinks, collapsed, setCollapsed }: SideBarProps) => {
  const navigate = useNavigate();
  const { requireLogin } = useLoginRequired();

  const handleCreatePost = () => {
    if (!requireLogin({ message: "Vui lòng đăng nhập để tạo bài viết" }))
      return;
    navigate("/post/create");
  };

  return (
    <div
      className={`sticky top-0 w-[240px] h-screen bg-[#FAF5F7] px-4 primary-text transition-transform duration-300 ${
        collapsed ? "translate-x-[-100%]" : "translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between h-[70px]">
        <div className="text-3xl font-bold">
          <img src={logo} alt="Blookie Logo" className="h-10" />
        </div>
        <button
          className="hover:bg-[#FFE4EC] p-1 rounded-lg transition-colors duration-100"
          onClick={() => setCollapsed && setCollapsed(true)}
        >
          <HiOutlineX fontSize={28} style={{ color: "#F295B6" }} />
        </button>
      </div>

      {/* Create Post Button */}
      <div className="mt-6 mb-4">
        <button
          onClick={handleCreatePost}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#F295B6] to-[#FFB8D1] text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
        >
          <FiPlusCircle
            fontSize={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          <span>Tạo bài viết</span>
        </button>
      </div>

      <nav className="mt-4">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#FFE4EC] hover:text-[#8C1D35] hover:translate-x-1 group font-semibold"
              >
                <div className="text-[#F295B6] group-hover:scale-110 transition-transform duration-200">
                  {link.icon}
                </div>
                <div>{link.name}</div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
