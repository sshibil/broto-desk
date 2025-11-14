import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NavLink } from "@/components/NavLink";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <>
      <div className="floating-bubbles">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
      </div>
      <div className="min-h-screen bg-background relative z-10">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2 hover-scale">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent">
                BrotoDesk
              </h1>
            </Link>

            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-3">
                {profile?.role === "STUDENT" && (
                  <NavLink to="/student">My Dashboard</NavLink>
                )}
                {profile?.role === "STAFF" && (
                  <NavLink to="/staff">Staff Dashboard</NavLink>
                )}
                {profile?.role === "ADMIN" && (
                  <>
                    <NavLink to="/admin">Admin Dashboard</NavLink>
                    <NavLink to="/admin/users">User Management</NavLink>
                  </>
                )}
              </nav>

              <div className="hidden md:flex items-center gap-3 border-l pl-4">
                <span className="text-sm font-medium">{profile?.name}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-sm">
                  {profile?.role}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hidden md:flex hover-scale"
              >
                <LogOut className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover-scale"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-card/95 backdrop-blur">
              <div className="container py-4 space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{profile?.name}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold">
                    {profile?.role}
                  </span>
                </div>
                <nav className="space-y-2">
                  {profile?.role === "STUDENT" && (
                    <NavLink to="/student" className="block">My Dashboard</NavLink>
                  )}
                  {profile?.role === "STAFF" && (
                    <NavLink to="/staff" className="block">Staff Dashboard</NavLink>
                  )}
                  {profile?.role === "ADMIN" && (
                    <>
                      <NavLink to="/admin" className="block">Admin Dashboard</NavLink>
                      <NavLink to="/admin/users" className="block">User Management</NavLink>
                    </>
                  )}
                </nav>
                <Button
                  variant="outline"
                  className="w-full hover-scale"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </header>

        <main className="container py-6">
          {children}
        </main>
      </div>
    </>
  );
};
