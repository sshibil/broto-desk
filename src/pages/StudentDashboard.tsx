import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { formatDistanceToNow } from "date-fns";

const StudentDashboard = () => {
  const { user } = useAuth();

  const { data: complaints, isLoading } = useQuery({
    queryKey: ["student-complaints", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          department:departments(name),
          category:categories(name)
        `)
        .eq("student_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["student-stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("status")
        .eq("student_id", user?.id);

      if (error) throw error;

      const total = data.length;
      const open = data.filter(c => !["RESOLVED", "CLOSED"].includes(c.status)).length;
      const resolved = data.filter(c => ["RESOLVED", "CLOSED"].includes(c.status)).length;

      return { total, open, resolved };
    },
    enabled: !!user,
  });

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Complaints</h1>
              <p className="text-muted-foreground">
                Submit and track your complaints
              </p>
            </div>
            <Button asChild>
              <Link to="/student/new-complaint">
                <Plus className="mr-2 h-4 w-4" />
                New Complaint
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.open || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <FileText className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.resolved || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>
                Your submitted complaints and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading complaints...
                </div>
              ) : complaints && complaints.length > 0 ? (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <Link
                      key={complaint.id}
                      to={`/student/complaint/${complaint.id}`}
                      className="block"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {complaint.code}
                            </span>
                            <StatusBadge status={complaint.status as any} />
                            <PriorityBadge priority={complaint.priority as any} />
                          </div>
                          <h3 className="font-semibold">{complaint.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {complaint.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{complaint.department?.name}</span>
                            {complaint.category && <span>• {complaint.category.name}</span>}
                            <span>
                              • {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No complaints yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by submitting your first complaint
                  </p>
                  <Button asChild>
                    <Link to="/student/new-complaint">
                      <Plus className="mr-2 h-4 w-4" />
                      Submit Complaint
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default StudentDashboard;
