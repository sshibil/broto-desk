import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, FileText } from "lucide-react";

const NewComplaint = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !departmentId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("complaints")
        .insert([{
          title: title.trim(),
          description: description.trim(),
          department_id: parseInt(departmentId),
          category_id: categoryId ? parseInt(categoryId) : null,
          priority: priority as any,
          student_id: user?.id,
          status: "SUBMITTED" as any,
          code: "",
        }])
        .select()
        .single();

      if (error) throw error;

      // Log the submission
      await supabase.from("activity_log").insert({
        complaint_id: data.id,
        actor_id: user?.id,
        action: "COMPLAINT_CREATED",
        meta: { title, department_id: departmentId },
      });

      // Subscribe the student to their own complaint
      await supabase.from("subscriptions").insert({
        user_id: user?.id,
        complaint_id: data.id,
      });

      toast.success(`Complaint submitted successfully! Code: ${data.code}`);
      navigate(`/student/complaint/${data.id}`);
    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      toast.error(error.message || "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Layout>
        <div className="space-y-8 p-6 md:p-10">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-br from-primary via-accent to-primary-light rounded-3xl p-8 md:p-12 text-primary-foreground shadow-lg">
            <Button
              variant="ghost"
              onClick={() => navigate("/student")}
              className="mb-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary-foreground/10 rounded-2xl">
                <FileText className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">Submit New Complaint</h1>
                <p className="text-primary-foreground/90 text-lg">
                  Fill in the details below to submit your complaint
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <Card className="rounded-3xl shadow-lg border-0 max-w-3xl mx-auto">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-2xl font-bold">Complaint Details</CardTitle>
              <CardDescription className="text-base">
                Please provide clear and detailed information about your concern
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your complaint"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    required
                    className="rounded-xl h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/200 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your complaint..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    required
                    className="rounded-xl resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length}/2000 characters
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-semibold">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={departmentId}
                      onValueChange={setDepartmentId}
                      required
                    >
                      <SelectTrigger id="department" className="rounded-xl h-12">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()} className="rounded-lg">
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category" className="rounded-xl h-12">
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-semibold">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority" className="rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="LOW" className="rounded-lg">Low</SelectItem>
                      <SelectItem value="MEDIUM" className="rounded-lg">Medium (Default)</SelectItem>
                      <SelectItem value="HIGH" className="rounded-lg">High</SelectItem>
                      <SelectItem value="CRITICAL" className="rounded-lg">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Staff may adjust priority based on urgency
                  </p>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/student")}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl h-12 hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl h-12 hover:scale-[1.02] transition-transform"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Complaint"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default NewComplaint;