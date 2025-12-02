import React, { useContext } from "react";
import { useLocation, NavLink } from "react-router";
import {
  FileQuestionMark,
  Trophy,
  LayoutGrid,
  Edit3,
  SquarePlus,
  KeyRound,
} from "lucide-react";
import { AuthContext } from "../../contexts/adminAuthContext";

const SideMenu = () => {
  const location = useLocation();
  const { admin } = useContext(AuthContext);
  const pathName = location.pathname.replace("/admin", "") || "/";

  const adminMenu = [
    {
      id: 1,
      content: "Contests",
      path: "/",
      icon: <FileQuestionMark size={18} />,
    },
    {
      id: 2,
      content: "Credentials",
      path: "/credentials",
      icon: <KeyRound size={18} />,
    },
    {
      id: 3,
      content: "Results",
      path: "/results",
      icon: <Trophy size={18} />,
    },
  ];
  const coordinatorMenu = [
    {
      id: 1,
      content: "Dashboard",
      path: "/",
      icon: <LayoutGrid size={18} />,
    },
    {
      id: 2,
      content: "Credentials",
      path: "/credentials",
      icon: <KeyRound size={18} />,
    },
  ];
  const volunteerMenu = [
    {
      id: 1,
      content: "Dashboard",
      path: "/",
      icon: <LayoutGrid size={18} />,
    },
    {
      id: 2,
      content: "Add Problem",
      path: "/add-problem",
      icon: <SquarePlus size={18} />,
    },
  ];
  const menuItems =
    admin.role === "admin"
      ? adminMenu
      : admin.role == "coordinator"
        ? coordinatorMenu
        : volunteerMenu;

  return (
    <div className="w-full h-full border-r border-neutral-800/30 p-2">
      <ul className="w-full h-full flex flex-col gap-2">
        {menuItems.map((item) => {
          let isActive = false;

          if (item.path === "/") {
            isActive =
              pathName === "/" ||
              !menuItems.some(
                (m) => m.path !== "/" && pathName.startsWith(m.path),
              );
          } else {
            isActive = pathName.startsWith(item.path);
          }

          return (
            <li key={item.id}>
              <NavLink
                to={`/admin${item.path}`}
                className={`flex gap-2 items-center px-4 py-2 rounded  transition-colors ${
                  isActive
                    ? "bg-black  text-white"
                    : "text-black hover:bg-neutral-200"
                }`}
              >
                <div>{item.icon}</div>
                {item.content}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SideMenu;
