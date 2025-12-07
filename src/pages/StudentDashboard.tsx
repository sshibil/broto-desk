import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
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
        <div className="space-y-8 p-6 md:p-10">
          {/* Header Section with Green Theme */}
          <div className="premium-card bg-primary p-8 md:p-12 green-glow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-3">My Complaints</h1>
                <p className="text-primary-foreground/80 text-lg">
                  Submit and track your complaints with ease
                </p>
              </div>
              <Button 
                asChild 
                size="lg"
                className="rounded-full bg-background text-foreground hover:bg-background/90 gap-3 pl-6 pr-4 py-6 group shadow-lg"
              >
                <Link to="/student/new-complaint">
                  <Plus className="h-5 w-5" />
                  New Complaint
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-primary-foreground transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-10 w-10 text-primary" />
                <div className="text-4xl font-bold text-foreground">{stats?.total || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Total Complaints</h3>
              <p className="text-sm text-muted-foreground mt-1">All time submissions</p>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-10 w-10 text-warning" />
                <div className="text-4xl font-bold text-warning">{stats?.open || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Open</h3>
              <p className="text-sm text-muted-foreground mt-1">In progress</p>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <div className="text-4xl font-bold text-primary">{stats?.resolved || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Resolved</h3>
              <p className="text-sm text-muted-foreground mt-1">Successfully completed</p>
            </div>
          </div>

          {/* Complaints List */}
          <Card className="premium-card">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-2xl font-bold text-foreground">Recent Complaints</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                View and manage all your submitted complaints
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-4 text-muted-foreground">Loading your complaints...</p>
                </div>
              ) : complaints && complaints.length > 0 ? (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <Link
                      key={complaint.id}
                      to={`/student/complaint/${complaint.id}`}
                      className="block group"
                    >
                      <div className="p-6 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-mono font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {complaint.code}
                              </span>
                              <StatusBadge status={complaint.status} />
                              <PriorityBadge priority={complaint.priority} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {complaint.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {complaint.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {complaint.department?.name}
                              </span>
                              {complaint.category && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  {complaint.category.name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <div className="arrow-button arrow-button-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No complaints yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by submitting your first complaint
                  </p>
                  <Button asChild className="rounded-full bg-primary hover:bg-primary-light">
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