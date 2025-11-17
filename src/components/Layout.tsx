import { Outlet } from "react-router-dom";
import { NavLink } from "./NavLink";
import { ListTodo, LayoutDashboard, Users, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Layout = () => {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="bg-card border-b border-border shadow-soft sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-xl font-bold text-primary-foreground">
                SC
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                StudiCircle
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <NavLink
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>
              <NavLink
                to="/rooms"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Focus Rooms</span>
              </NavLink>
              <NavLink
                to="/community"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Community</span>
              </NavLink>
              <NavLink
                to="/tasks"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <ListTodo className="w-4 h-4" />
                <span className="hidden sm:inline">Tasks</span>
              </NavLink>
              {user && (
                <Button variant="outline" size="sm" onClick={signOut} className="ml-2">
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
