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
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 shadow-sm">
          <div className="container flex h-20 items-center justify-between px-6">
            <Link to="/dashboard" className="flex items-center space-x-2 hover-scale">
              <h1 className="text-2xl font-bold gradient-text">
                BrotoDesk
              </h1>
            </Link>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-1">
                {profile?.role === "STUDENT" && (
                  <NavLink to="/student" className="px-4 py-2">My Dashboard</NavLink>
                )}
                {profile?.role === "STAFF" && (
                  <NavLink to="/staff" className="px-4 py-2">Staff Dashboard</NavLink>
                )}
                {profile?.role === "ADMIN" && (
                  <>
                    <NavLink to="/admin" className="px-4 py-2">Admin Dashboard</NavLink>
                    <NavLink to="/admin/users" className="px-4 py-2">User Management</NavLink>
                  </>
                )}
              </nav>

              <div className="hidden md:flex items-center gap-4 border-l border-border pl-6">
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{profile?.name}</div>
                  <div className="text-xs text-muted-foreground">{profile?.email}</div>
                </div>
                <span className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold shadow-md">
                  {profile?.role}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hidden md:flex hover-scale rounded-xl"
              >
                <LogOut className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover-scale rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-lg">
              <div className="container py-6 space-y-4 px-6">
                <div className="flex flex-col gap-2 pb-4 border-b">
                  <span className="text-sm font-semibold text-foreground">{profile?.name}</span>
                  <span className="text-xs text-muted-foreground">{profile?.email}</span>
                  <span className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold shadow-md w-fit">
                    {profile?.role}
                  </span>
                </div>
                <nav className="space-y-2">
                  {profile?.role === "STUDENT" && (
                    <NavLink to="/student" className="block px-4 py-3 rounded-xl">My Dashboard</NavLink>
                  )}
                  {profile?.role === "STAFF" && (
                    <NavLink to="/staff" className="block px-4 py-3 rounded-xl">Staff Dashboard</NavLink>
                  )}
                  {profile?.role === "ADMIN" && (
                    <>
                      <NavLink to="/admin" className="block px-4 py-3 rounded-xl">Admin Dashboard</NavLink>
                      <NavLink to="/admin/users" className="block px-4 py-3 rounded-xl">User Management</NavLink>
                    </>
                  )}
                </nav>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full mt-4 rounded-xl h-12"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </header>

        <main className="bg-background">{children}</main>
      </div>
    </>
  );
};
