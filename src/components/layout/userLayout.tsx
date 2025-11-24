import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../header/header";
import SideBar from "../sidebar/sideBar";

import { FiHome } from "react-icons/fi";
import { FaUserGroup } from "react-icons/fa6";
import { FaArchive } from "react-icons/fa";

const navLinks = [
  { name: "Trang chủ", href: "/", icon: <FiHome fontSize={18} /> },
  { name: "Đã lưu", href: "/saved", icon: <FaArchive fontSize={18} /> },
  { name: "Nhóm", href: "/groups", icon: <FaUserGroup fontSize={18} /> },
];

const UserLayout = () => {
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
          isLoggedIn={true}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        ></Header>
        <main className="">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
