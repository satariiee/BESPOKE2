import { Home, Users, Calendar, MessageCircle, Activity } from "lucide-react";
import { Link, useLocation } from "react-router";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/staff" },
  { icon: Users, label: "Jemaah Saya", href: "/staff/jemaah-saya" },
  { icon: Calendar, label: "Jadwal Follow Up", href: "/staff/jadwal-followup" },
  { icon: MessageCircle, label: "Status Komunikasi", href: "/staff/status-komunikasi" },
  { icon: Activity, label: "Aktivitas Saya", href: "/staff/aktivitas-saya" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col" style={{ backgroundColor: "#1F6B7A" }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-white text-xl font-semibold">Jemaah Follow Up</h1>
        <p className="text-white/70 text-sm mt-1">Marketing Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={index}>
                <Link to={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-white/20 text-white" : "text-white/90 hover:bg-white/10"}`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      {/* <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">MS</div>
          <div>
            <p className="text-white text-sm font-medium">Marketing Staff</p>
            <p className="text-white/60 text-xs">staff@email.com</p>
          </div>
        </div>
      </div> */}
    </aside>
  );
}
