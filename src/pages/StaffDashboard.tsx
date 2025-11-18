import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { AlertCircle, Clock, CheckCircle, FileText, CheckCircle2 } from "lucide-react";

const StaffDashboard = () => {
  const { data: complaints, isLoading } = useQuery({
    queryKey: ["staff-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          department:departments(name),
          category:categories(name),
          student:profiles!complaints_student_id_fkey(name, email),
          assignee:profiles!complaints_assignee_id_fkey(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["staff-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("status, is_sla_breached");

      if (error) throw error;

      const total = data.length;
      const open = data.filter(c => !["RESOLVED", "CLOSED"].includes(c.status)).length;
      const slaBreached = data.filter(c => c.is_sla_breached && !["RESOLVED", "CLOSED"].includes(c.status)).length;
      const resolved = data.filter(c => ["RESOLVED", "CLOSED"].includes(c.status)).length;

      return { total, open, slaBreached, resolved };
    },
  });

  const openComplaints = complaints?.filter(c => !["RESOLVED", "CLOSED"].includes(c.status));
  const resolvedComplaints = complaints?.filter(c => c.status === "RESOLVED" || c.status === "CLOSED");

  return (
    <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
      <Layout>
        <div className="space-y-8 p-6 md:p-10">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-primary via-accent to-primary-light rounded-3xl p-8 md:p-12 text-white shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Staff Dashboard</h1>
            <p className="text-white/90 text-lg">
              Manage and resolve student complaints efficiently
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-10 w-10 text-primary" />
                <div className="text-4xl font-bold text-foreground">{stats?.total || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Total</h3>
              <p className="text-sm text-muted-foreground mt-1">All complaints</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-10 w-10 text-warning" />
                <div className="text-4xl font-bold text-warning">{stats?.open || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Open</h3>
              <p className="text-sm text-muted-foreground mt-1">Needs attention</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div className="text-4xl font-bold text-destructive">{stats?.slaBreached || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">SLA Breached</h3>
              <p className="text-sm text-muted-foreground mt-1">Urgent action required</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="h-10 w-10 text-success" />
                <div className="text-4xl font-bold text-success">{stats?.resolved || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Resolved</h3>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </div>
          </div>

          {/* Complaints Tabs */}
          <Card className="rounded-3xl shadow-lg border-0">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-2xl font-bold">Complaints Queue</CardTitle>
              <CardDescription className="text-base">
                Review and manage student complaints
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
              <Tabs defaultValue="open" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-2xl">
                  <TabsTrigger value="open" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Open ({openComplaints?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Resolved ({resolvedComplaints?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                      <p className="mt-4 text-muted-foreground">Loading complaints...</p>
                    </div>
                  ) : openComplaints && openComplaints.length > 0 ? (
                    openComplaints.map((complaint) => (
                      <Link
                        key={complaint.id}
                        to={`/staff/complaint/${complaint.id}`}
                        className="block group"
                      >
                        <div className="p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-mono font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                {complaint.code}
                              </span>
                              <StatusBadge status={complaint.status} />
                              <PriorityBadge priority={complaint.priority} />
                              {complaint.is_sla_breached && (
                                <span className="text-xs font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-lg">
                                  SLA BREACHED
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {complaint.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {complaint.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span>Student: {complaint.student?.name}</span>
                              <span>Department: {complaint.department?.name}</span>
                              {complaint.assignee && <span>Assigned: {complaint.assignee.name}</span>}
                              <span>{formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <CheckCircle2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                      <p className="text-muted-foreground">No open complaints at the moment</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="resolved" className="space-y-4">
                  {resolvedComplaints && resolvedComplaints.length > 0 ? (
                    resolvedComplaints.map((complaint) => (
                      <Link
                        key={complaint.id}
                        to={`/staff/complaint/${complaint.id}`}
                        className="block group"
                      >
                        <div className="p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-mono font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                {complaint.code}
                              </span>
                              <StatusBadge status={complaint.status} />
                              <PriorityBadge priority={complaint.priority} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {complaint.title}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span>Student: {complaint.student?.name}</span>
                              <span>Department: {complaint.department?.name}</span>
                              {complaint.assignee && <span>Resolved by: {complaint.assignee.name}</span>}
                              <span>{formatDistanceToNow(new Date(complaint.resolved_at || complaint.updated_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No resolved complaints</h3>
                      <p className="text-muted-foreground">Resolved complaints will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default StaffDashboard;
