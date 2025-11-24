import { useState } from "react";
import Header from "../header/header";
import SideBar from "../sidebar/sideBar";

import { MdOutlineSpaceDashboard } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MdReportGmailerrorred } from "react-icons/md";

const navLinks = [
  {
    name: "Thống kê",
    href: "#",
    icon: <MdOutlineSpaceDashboard fontSize={18} />,
  },
  { name: "Quản lí người dùng", href: "#", icon: <FiUser fontSize={18} /> },
  {
    name: "Quản lí bài đăng",
    href: "#",
    icon: <HiOutlineDocumentText fontSize={18} />,
  },
  {
    name: "Quản lí báo cáo",
    href: "#",
    icon: <MdReportGmailerrorred fontSize={18} />,
  },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      <SideBar
        navLinks={navLinks}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      ></SideBar>
      <div
        className={`flex-1 flex flex-col transition-all duration-300 px-15 ${
          collapsed ? "ml-[-240px]" : "ml-0"
        }`}
      >
        <Header
          layout="user"
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        ></Header>
        <main>main content...</main>
      </div>
    </div>
  );
};

export default AdminLayout;
