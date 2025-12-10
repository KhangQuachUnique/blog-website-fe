import { HiOutlineX } from "react-icons/hi";

import logo from "../../assets/logo.png";

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
      <nav className="mt-8">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-[#FFE4EC] hover:text-[#8C1D35] hover:translate-x-1 group font-label"
              >
                <div className="text-[#F295B6] group-hover:scale-110 transition-transform duration-200">
                  {link.icon}
                </div>
                <div>{link.name}</div>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
