import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, MessageSquare, User, Building2, Tag, Calendar, UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const ComplaintDetails = () => {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [complaint, setComplaint] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const id = idParam ? parseInt(idParam, 10) : null;
  const isStaff = profile?.role === "STAFF" || profile?.role === "ADMIN";

  useEffect(() => {
    if (id) {
      fetchComplaintDetails();
      fetchComments();
    }
  }, [id]);

  const fetchComplaintDetails = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          department:departments(name),
          category:categories(name),
          student:profiles!complaints_student_id_fkey(name, email),
          assignee:profiles!complaints_assignee_id_fkey(name, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Check access: students can only view their own complaints, staff can view all
      if (!isStaff && data.student_id !== user?.id) {
        toast.error("You don't have permission to view this complaint");
        navigate("/dashboard");
        return;
      }

      setComplaint(data);
    } catch (error: any) {
      console.error("Error fetching complaint:", error);
      toast.error("Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          author:profiles(name, email, role)
        `)
        .eq("complaint_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase.from("comments").insert([{
        complaint_id: id,
        author_id: user?.id,
        body: newComment,
        is_internal: false,
      }]);

      if (error) throw error;

      toast.success("Comment added successfully");
      setNewComment("");
      fetchComments();
      fetchComplaintDetails(); // Refresh to update timestamps
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    setUpdatingStatus(true);
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "RESOLVED") {
        updateData.resolved_at = new Date().toISOString();
      } else if (newStatus === "CLOSED") {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("complaints")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success("Status updated successfully");
      fetchComplaintDetails();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!complaint) {
    return (
      <Layout>
        <div className="p-6 md:p-10">
          <Card className="rounded-3xl shadow-lg border-0">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground text-lg">Complaint not found</p>
              <Button 
                variant="outline" 
                onClick={() => navigate(isStaff ? "/staff" : "/student")}
                className="mt-4 rounded-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8 p-6 md:p-10">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-br from-primary via-accent to-primary-light rounded-3xl p-8 md:p-12 text-primary-foreground shadow-lg">
            <Button
              variant="ghost"
              onClick={() => navigate(isStaff ? "/staff" : "/student")}
              className="mb-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-mono font-bold bg-primary-foreground/20 px-4 py-2 rounded-xl">
                    {complaint.code}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                  {complaint.is_sla_breached && (
                    <span className="text-xs font-semibold bg-destructive text-destructive-foreground px-3 py-1 rounded-lg">
                      SLA BREACHED
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{complaint.title}</h1>
              </div>
              
              {isStaff && (
                <Select
                  value={complaint.status}
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-[200px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="SUBMITTED" className="rounded-lg">Submitted</SelectItem>
                    <SelectItem value="UNDER_REVIEW" className="rounded-lg">Under Review</SelectItem>
                    <SelectItem value="IN_PROGRESS" className="rounded-lg">In Progress</SelectItem>
                    <SelectItem value="WAITING_ON_STUDENT" className="rounded-lg">Waiting on Student</SelectItem>
                    <SelectItem value="RESOLVED" className="rounded-lg">Resolved</SelectItem>
                    <SelectItem value="CLOSED" className="rounded-lg">Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Complaint Details Card */}
          <Card className="rounded-3xl shadow-lg border-0">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-2xl font-bold">Description</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0 space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">Department</span>
                  </div>
                  <p className="font-semibold text-foreground">{complaint.department?.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">Category</span>
                  </div>
                  <p className="font-semibold text-foreground">{complaint.category?.name || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserCircle className="h-4 w-4" />
                    <span className="text-sm">Submitted By</span>
                  </div>
                  <p className="font-semibold text-foreground">{complaint.student?.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Submitted</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Card */}
          <Card className="rounded-3xl shadow-lg border-0">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                Comments
              </CardTitle>
              <CardDescription className="text-base">
                Conversation history for this complaint
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0 space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-4 p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">{comment.author?.name}</span>
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-lg">
                            {comment.author?.role}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed">{comment.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="space-y-4 pt-6 border-t border-border">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={4}
                  maxLength={2000}
                  className="rounded-xl resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {newComment.length}/2000 characters
                  </p>
                  <Button 
                    type="submit" 
                    disabled={submittingComment || !newComment.trim()}
                    className="rounded-xl hover:scale-[1.02] transition-transform"
                  >
                    {submittingComment && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Comment
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

export default ComplaintDetails;