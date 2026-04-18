import { Link, useLocation } from "react-router";
import { LayoutDashboard, Users, Calendar, MessageSquare, FileText, UserCog, Settings, Compass } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const baseMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Data Calon Jemaah", path: "/data-calon-jemaah" },
  { icon: Calendar, label: "Jadwal Follow Up", path: "/jadwal-follow-up" },
  {
    icon: MessageSquare,
    label: "Status Komunikasi",
    path: "/status-komunikasi",
  },
  { icon: FileText, label: "Laporan Closing", path: "/laporan-closing" },
];

const adminMenuItems = [{ icon: UserCog, label: "Pengguna", path: "/pengguna" }];

const commonMenuItems = [{ icon: Settings, label: "Settings", path: "/settings" }];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  // Build menu based on role
  let menuItems = [...baseMenuItems];
  if (user?.role === "admin") {
    menuItems = [...menuItems, ...adminMenuItems];
  }
  menuItems = [...menuItems, ...commonMenuItems];

  return (
    <aside className="w-64 bg-[#1F6B7A] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#176059]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Compass className="w-6 h-6 text-[#1F6B7A]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Jemaah Follow Up</h1>
            <p className="text-xs text-white/70">Management System</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive ? "bg-white text-[#1F6B7A] shadow-md" : "text-white/90 hover:bg-[#176059]"}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-[#176059]">
        <div className="text-xs text-white/60 text-center">© 2026 Umrah Travel</div>
      </div>
    </aside>
  );
}
