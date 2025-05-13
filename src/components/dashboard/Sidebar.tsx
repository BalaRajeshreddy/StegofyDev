import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  QrCode,
  LayoutPanelLeft,
  Folder,
  BarChart2,
  Settings,
  Users,
  LogOut,
  ShoppingCart,
  ChevronDown,
  User
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  userType: 'Brand' | 'User' | 'Admin';
}

export function Sidebar({ userType }: SidebarProps) {
  const location = useLocation();
  const path = location.pathname;
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const brandMenuItems = [
    { name: "Dashboard", path: "/dashboard/brand", icon: <LayoutDashboard size={18} /> },
    { name: "QR Codes", path: "/dashboard/brand/qr-codes", icon: <QrCode size={18} /> },
    { name: "Landing Pages", path: "/dashboard/brand/landing-pages", icon: <LayoutPanelLeft size={18} /> },
    { name: "Products", path: "/dashboard/brand/products", icon: <ShoppingCart size={18} /> },
    { name: "File Manager", path: "/dashboard/brand/files", icon: <Folder size={18} /> },
    { name: "Analytics", path: "/dashboard/brand/analytics", icon: <BarChart2 size={18} /> },
  ];

  const adminMenuItems = [
    { name: "Dashboard", path: "/dashboard/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Brands", path: "/dashboard/admin/brands", icon: <Users size={18} /> },
    { name: "Users", path: "/dashboard/admin/users", icon: <Users size={18} /> },
    { name: "Analytics", path: "/dashboard/admin/analytics", icon: <BarChart2 size={18} /> },
  ];

  const userMenuItems = [
    { name: "Dashboard", path: "/dashboard/user", icon: <LayoutDashboard size={18} /> },
    { name: "Browse QR Codes", path: "/dashboard/user/qr-codes", icon: <QrCode size={18} /> },
    { name: "Landing Pages", path: "/dashboard/user/landing-pages", icon: <LayoutPanelLeft size={18} /> },
  ];

  const menuItems = userType === 'Brand' 
    ? brandMenuItems 
    : userType === 'Admin' 
      ? adminMenuItems 
      : userMenuItems;

  return (
    <div className="h-screen w-64 border-r bg-sidebar">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="text-xl font-bold">QR Nexus</div>
          <div className="text-xs text-muted-foreground">{userType} Portal</div>
        </div>
        
        <div className="flex-1 overflow-auto py-6 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${path === item.path ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <div>
              <button
                className={`sidebar-item w-full flex items-center justify-between ${path.startsWith('/dashboard/brand/settings') || path.startsWith('/dashboard/admin/settings') || path.startsWith('/dashboard/user/settings') || path === '/profile' ? 'active' : ''}`}
                onClick={() => setSettingsOpen((open) => !open)}
                type="button"
              >
                <span className="flex items-center">
                  <Settings size={18} className="mr-2" />
                  Settings
                </span>
                <ChevronDown size={16} className={`transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>
              {settingsOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  <Link
                    to="/profile"
                    className={`sidebar-item ${path === '/profile' ? 'active' : ''} flex items-center`}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <Link
                    to={
                      userType === 'Brand' ? '/dashboard/brand/settings' :
                      userType === 'Admin' ? '/dashboard/admin/settings' :
                      '/dashboard/user/settings'
                    }
                    className={`sidebar-item ${path === '/dashboard/brand/settings' || path === '/dashboard/admin/settings' || path === '/dashboard/user/settings' ? 'active' : ''} flex items-center`}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/">
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
