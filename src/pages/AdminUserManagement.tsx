import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, User, Users, UserPlus, FileText } from "lucide-react";
import { toast } from "sonner";

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "STAFF" | "ADMIN";
  is_active: boolean;
  created_at: string;
  complaint_count?: number;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "STUDENT" as "STUDENT" | "STAFF" | "ADMIN"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch complaint counts for each user
      const { data: complaints, error: complaintsError } = await supabase
        .from("complaints")
        .select("student_id");

      if (complaintsError) throw complaintsError;

      // Count complaints per user
      const complaintCounts = complaints?.reduce((acc, complaint) => {
        acc[complaint.student_id] = (acc[complaint.student_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: (userRole?.role || "STUDENT") as "STUDENT" | "STAFF" | "ADMIN",
          complaint_count: complaintCounts[profile.id] || 0
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "STUDENT" | "STAFF" | "ADMIN") => {
    try {
      // Update both user_roles and profiles to keep them in sync
      const [rolesResult, profilesResult] = await Promise.all([
        supabase
          .from("user_roles")
          .upsert({
            user_id: userId,
            role: newRole,
            updated_at: new Date().toISOString()
          }, {
            onConflict: "user_id"
          }),
        supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", userId)
      ]);

      if (rolesResult.error) throw rolesResult.error;
      if (profilesResult.error) throw profilesResult.error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "STAFF":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      case "STAFF":
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      toast.success("User created successfully");
      setDialogOpen(false);
      setNewUser({ email: "", password: "", name: "", role: "STUDENT" });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create user";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  // Calculate stats
  const stats = {
    total: users.length,
    students: users.filter(u => u.role === "STUDENT").length,
    staff: users.filter(u => u.role === "STAFF").length,
    admins: users.filter(u => u.role === "ADMIN").length,
  };

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </ProtectedRoute>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="space-y-8 p-6 md:p-10">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-br from-primary via-accent to-primary-light rounded-3xl p-8 md:p-12 text-primary-foreground shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">User Management</h1>
                <p className="text-primary-foreground/90 text-lg">
                  Manage user roles and permissions across the system
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="bg-background text-primary hover:bg-background/90 rounded-2xl shadow-md hover:shadow-xl transition-all hover:scale-105"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New User</DialogTitle>
                    <DialogDescription className="text-base">
                      Add a new user to the system with their email, password, and role
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Min. 6 characters"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-semibold">Role</Label>
                      <Select 
                        value={newUser.role} 
                        onValueChange={(value: "STUDENT" | "STAFF" | "ADMIN") => 
                          setNewUser({ ...newUser, role: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="STUDENT" className="rounded-lg">Student</SelectItem>
                          <SelectItem value="STAFF" className="rounded-lg">Staff</SelectItem>
                          <SelectItem value="ADMIN" className="rounded-lg">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      disabled={creating}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={creating} className="rounded-xl">
                      {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-10 w-10 text-primary" />
                <div className="text-4xl font-bold text-foreground">{stats.total}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Total Users</h3>
              <p className="text-sm text-muted-foreground mt-1">All registered users</p>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <User className="h-10 w-10 text-accent" />
                <div className="text-4xl font-bold text-accent">{stats.students}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Students</h3>
              <p className="text-sm text-muted-foreground mt-1">Student accounts</p>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-10 w-10 text-primary-light" />
                <div className="text-4xl font-bold text-primary-light">{stats.staff}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Staff</h3>
              <p className="text-sm text-muted-foreground mt-1">Staff members</p>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <Shield className="h-10 w-10 text-destructive" />
                <div className="text-4xl font-bold text-destructive">{stats.admins}</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Admins</h3>
              <p className="text-sm text-muted-foreground mt-1">Administrators</p>
            </div>
          </div>

          {/* Users Table */}
          <Card className="rounded-3xl shadow-lg border-0">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-2xl font-bold">All Users</CardTitle>
              <CardDescription className="text-base">
                View and manage all registered users in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
              <div className="rounded-2xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Current Role</TableHead>
                      <TableHead className="font-semibold">Complaints</TableHead>
                      <TableHead className="font-semibold">Change Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow 
                        key={user.id} 
                        className="hover:bg-accent/5 transition-colors duration-200"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{user.name}</span>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1 rounded-lg">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg">
                            {user.complaint_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value as "STUDENT" | "STAFF" | "ADMIN")}
                          >
                            <SelectTrigger className="w-[140px] rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="STUDENT" className="rounded-lg">Student</SelectItem>
                              <SelectItem value="STAFF" className="rounded-lg">Staff</SelectItem>
                              <SelectItem value="ADMIN" className="rounded-lg">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.is_active ? "default" : "outline"}
                            className={`rounded-lg ${user.is_active ? 'bg-success text-success-foreground' : ''}`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
