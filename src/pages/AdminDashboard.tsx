import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Tag, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System overview and configuration
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.students} students, {stats?.staff} staff
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Complaints</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalComplaints || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.openComplaints} open
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.departments || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.categories || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>
                      Current system status and metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Open Complaints</span>
                      <span className="text-sm font-bold">{stats?.openComplaints || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SLA Breached</span>
                      <span className="text-sm font-bold text-destructive">{stats?.slaBreached || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Users</span>
                      <span className="text-sm font-bold">{stats?.totalUsers || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link to="/staff" className="block">
                      <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <p className="text-sm font-medium">View All Complaints</p>
                        <p className="text-xs text-muted-foreground">Manage complaint queue</p>
                      </div>
                    </Link>
                    <div className="p-3 rounded-lg border opacity-50">
                      <p className="text-sm font-medium">Manage Users</p>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                    <div className="p-3 rounded-lg border opacity-50">
                      <p className="text-sm font-medium">System Reports</p>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>
                    Manage departments, categories, and SLA policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configuration interface coming soon. You can currently manage these through the backend.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
