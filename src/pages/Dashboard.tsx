import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      // Redirect based on role
      switch (profile.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "STAFF":
          navigate("/staff");
          break;
        case "STUDENT":
          navigate("/student");
          break;
        default:
          navigate("/student");
      }
    }
  }, [profile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Dashboard;
