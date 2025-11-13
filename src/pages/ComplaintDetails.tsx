import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { ArrowLeft, Loader2, MessageSquare, Clock, User } from "lucide-react";
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
  const isOwner = complaint?.student_id === user?.id;

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
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Complaint not found</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(isStaff ? "/staff" : "/student")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {complaint.code}
                    </span>
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                  <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                </div>
                {isStaff && (
                  <Select
                    value={complaint.status}
                    onValueChange={handleStatusChange}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="WAITING_ON_STUDENT">Waiting on Student</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{complaint.department?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{complaint.category?.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Submitted By</p>
                  <p className="font-medium">{complaint.student?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
              <CardDescription>
                Conversation history for this complaint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.author?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="space-y-4 pt-4 border-t">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button type="submit" disabled={submittingComment || !newComment.trim()}>
                  {submittingComment && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Comment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ComplaintDetails;
