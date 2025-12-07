import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Tag, Settings, FileText, AlertCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [complaintsData, usersData, departmentsData, categoriesData] = await Promise.all([
        supabase.from("complaints").select("status, is_sla_breached"),
        supabase.from("profiles").select("role"),
        supabase.from("departments").select("id"),
        supabase.from("categories").select("id"),
      ]);

      const complaints = complaintsData.data || [];
      const users = usersData.data || [];
      
      return {
        totalComplaints: complaints.length,
        openComplaints: complaints.filter(c => !["RESOLVED", "CLOSED"].includes(c.status)).length,
        resolvedComplaints: complaints.filter(c => ["RESOLVED", "CLOSED"].includes(c.status)).length,
        slaBreached: complaints.filter(c => c.is_sla_breached).length,
        totalUsers: users.length,
        students: users.filter(u => u.role === "STUDENT").length,
        staff: users.filter(u => u.role === "STAFF").length,
        admins: users.filter(u => u.role === "ADMIN").length,
        departments: departmentsData.data?.length || 0,
        categories: categoriesData.data?.length || 0,
      };
    },
  });

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Layout>
        <div className="space-y-8 p-6 md:p-10">
          {/* Header Section */}
          <div className="premium-card bg-primary p-8 md:p-12 green-glow">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-3">Admin Dashboard</h1>
            <p className="text-primary-foreground/80 text-lg">
              System overview and configuration management
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-10 w-10 text-primary" />
                <div className="text-4xl font-bold text-foreground">{stats?.totalUsers || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Total Users</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.students} students, {stats?.staff} staff
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-10 w-10 text-primary" />
                <div className="text-4xl font-bold text-foreground">{stats?.totalComplaints || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Complaints</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.openComplaints} open, {stats?.resolvedComplaints} resolved
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="h-10 w-10 text-primary" />
                <div className="text-4xl font-bold text-foreground">{stats?.departments || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Departments</h3>
              <p className="text-sm text-muted-foreground mt-1">Active departments</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <Tag className="h-10 w-10 text-primary" />
                <div className="text-4xl font-bold text-foreground">{stats?.categories || 0}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Categories</h3>
              <p className="text-sm text-muted-foreground mt-1">Active categories</p>
            </div>
          </div>

          {/* Tabs Section */}
          <Card className="premium-card">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-2xl font-bold text-foreground">System Management</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Configure and manage system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-full">
                  <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="config" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Configuration
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* System Health */}
                    <div className="p-6 rounded-2xl border border-border bg-card">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        System Health
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">SLA Breaches</span>
                          <span className="text-lg font-bold text-destructive">{stats?.slaBreached || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Open Tickets</span>
                          <span className="text-lg font-bold text-warning">{stats?.openComplaints || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Resolution Rate</span>
                          <span className="text-lg font-bold text-primary">
                            {stats?.totalComplaints ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-6 rounded-2xl border border-border bg-card">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <Button asChild variant="outline" className="w-full justify-between rounded-full h-12 border-border hover:border-primary/30 hover:bg-muted/50 group">
                          <Link to="/admin/users">
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Manage Users
                            </span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-between rounded-full h-12 border-border hover:border-primary/30 hover:bg-muted/50 group">
                          <Link to="/staff">
                            <span className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              View All Complaints
                            </span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* User Distribution */}
                  <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="text-lg font-semibold text-foreground mb-4">User Distribution</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 rounded-2xl bg-primary/10 border border-primary/20">
                        <div className="text-3xl font-bold text-primary mb-1">{stats?.students || 0}</div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-primary/10 border border-primary/20">
                        <div className="text-3xl font-bold text-primary mb-1">{stats?.staff || 0}</div>
                        <div className="text-sm text-muted-foreground">Staff</div>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-primary/10 border border-primary/20">
                        <div className="text-3xl font-bold text-primary mb-1">{stats?.admins || 0}</div>
                        <div className="text-sm text-muted-foreground">Admins</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                  <div className="text-center py-16">
                    <Settings className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Configuration Settings</h3>
                    <p className="text-muted-foreground mb-6">
                      Advanced system configuration options coming soon
                    </p>
                    <Button asChild className="rounded-full bg-primary hover:bg-primary-light">
                      <Link to="/admin/users">
                        Manage Users
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;