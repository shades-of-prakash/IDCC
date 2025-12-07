import React from "react";
import Navbar from "../components/Admin/Navbar";
import SideMenu from "../components/Admin/SideMenu";
import { Outlet } from "react-router";
const AdminLayout = () => {
    return (
        <main className="w-screen h-dvh flex flex-col">
            <nav className="h-16">
                <Navbar />
            </nav>
            <section className="flex w-full h-[calc(100%-4rem)] ">
                <div className="w-44 ">
                    <SideMenu />
                </div>
                <div className="h-full w-[calc(100%-11rem)]">
                    <Outlet />
                </div>
            </section>
        </main>
    );
};

export default AdminLayout;
