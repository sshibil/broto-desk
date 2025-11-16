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
import { AlertCircle, Clock, CheckCircle, FileText } from "lucide-react";

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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and resolve student complaints
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
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
                <CardTitle className="text-sm font-medium">SLA Breached</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats?.slaBreached || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.resolved || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="open" className="space-y-4">
            <TabsList>
              <TabsTrigger value="open">Open Complaints</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Open Complaints</CardTitle>
                  <CardDescription>
                    Complaints requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading complaints...
                    </div>
                  ) : openComplaints && openComplaints.length > 0 ? (
                    <div className="space-y-4">
                      {openComplaints.map((complaint) => (
                        <Link
                          key={complaint.id}
                          to={`/staff/complaint/${complaint.id}`}
                          className="block"
                        >
                          <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs text-muted-foreground">
                                  {complaint.code}
                                </span>
                                <StatusBadge status={complaint.status as any} />
                                <PriorityBadge priority={complaint.priority as any} />
                                {complaint.is_sla_breached && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
                                    SLA Breached
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold">{complaint.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {complaint.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>By: {complaint.student?.name}</span>
                                <span>• {complaint.department?.name}</span>
                                {complaint.assignee && <span>• Assigned to: {complaint.assignee.name}</span>}
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
                    <div className="text-center py-8 text-muted-foreground">
                      No open complaints
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resolved Complaints</CardTitle>
                  <CardDescription>
                    Recently resolved complaints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading complaints...
                    </div>
                  ) : resolvedComplaints && resolvedComplaints.length > 0 ? (
                    <div className="space-y-4">
                      {resolvedComplaints.slice(0, 20).map((complaint) => (
                        <Link
                          key={complaint.id}
                          to={`/staff/complaint/${complaint.id}`}
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
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>By: {complaint.student?.name}</span>
                                <span>• {complaint.department?.name}</span>
                                {complaint.assignee && <span>• Resolved by: {complaint.assignee.name}</span>}
                                <span>
                                  • {formatDistanceToNow(new Date(complaint.resolved_at || complaint.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No resolved complaints yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default StaffDashboard;
