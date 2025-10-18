import React,{ useContext }  from "react";
import Navbar from "../components/Admin/Navbar";
import SideMenu from "../components/Admin/SideMenu";
import { Outlet } from "react-router";
import { AuthContext } from "../contexts/adminAuthContext";
const AdminLayout = () => {
  const { admin } = useContext(AuthContext);
  const isAdminOrCoordinator=["admin","coordinator"].includes(admin.role)?true:false;
  return (
			<main className="w-screen h-dvh flex flex-col">
				<nav className="h-16">
					<Navbar />
				</nav>
				<section className="flex w-full h-[calc(100%-4rem)] ">
					{isAdminOrCoordinator && <div className="w-48 ">
						<SideMenu />
					</div>}
					<div className={`h-full ${isAdminOrCoordinator?"w-[calc(100%-12rem)]":"w-full"}`}>
						<Outlet />
					</div>
				</section>
			</main>
		);
};

export default AdminLayout;
