import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, LayoutDashboard, FileText, Award, Settings, LogOut, Users, Menu, X, CreditCard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
const DashboardLayout = ({ children }) => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleLogout = () => {
        logout();
        navigate("/");
    };
    const employeeLinks = [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/exams", icon: FileText, label: "Exams" },
        { to: "/certificates", icon: Award, label: "Certificates" },
        { to: "/settings", icon: Settings, label: "Account" },
    ];
    const adminLinks = [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/admin/users", icon: Users, label: "Users" },
        { to: "/admin/exams", icon: FileText, label: "Exams" },
        { to: "/admin/certificates", icon: Award, label: "Certificates" },
        { to: "/admin/results", icon: CreditCard, label: "Payments & Results" },
        { to: "/settings", icon: Settings, label: "Account" },
    ];
    const links = isAdmin ? adminLinks : employeeLinks;
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    return (<div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (<div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>)}

      {/* Sidebar */}
      <aside className={cn("fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="h-16 flex items-center px-4 border-b border-border gap-2">
          <div className="h-8 w-8 rounded-lg hero-gradient flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground"/>
          </div>
          <span className="font-heading font-bold text-foreground">ExamPro</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-muted-foreground"/>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((l) => (<Link key={l.to} to={l.to} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", location.pathname === l.to
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <l.icon className="h-4 w-4"/>
              {l.label}
            </Link>))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user?.photo_url ? (<img src={`${API_BASE}${user.photo_url}`} alt="" className="h-8 w-8 rounded-full object-cover"/>) : (<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4"/> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button className="lg:hidden mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground"/>
          </button>
          <h2 className="font-heading font-semibold text-foreground">
            {links.find((l) => l.to === location.pathname)?.label || "ExamPro"}
          </h2>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>);
};
export default DashboardLayout;
