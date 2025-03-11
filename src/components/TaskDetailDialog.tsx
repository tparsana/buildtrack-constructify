
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, getStatusColor, getPriorityColor } from "@/lib/data";
import { Task, User } from "@/lib/data";
import StatusBadge from "./StatusBadge";
import { Calendar, MessageSquare, Paperclip, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { addComment } from "@/lib/dataUtils";

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onUpdateTask: (task: Task) => void;
}

const TaskDetailDialog = ({ 
  task, 
  open, 
  onOpenChange, 
  users, 
  onUpdateTask 
}: TaskDetailDialogProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id || "");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as Task["status"]);
    const updatedTask = { 
      ...task, 
      status: newStatus as Task["status"],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateTask(updatedTask);
    toast({
      title: "Status Updated",
      description: `Task status changed to ${newStatus.replace(/-/g, ' ')}`,
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority as Task["priority"]);
    const updatedTask = { 
      ...task, 
      priority: newPriority as Task["priority"],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateTask(updatedTask);
    toast({
      title: "Priority Updated",
      description: `Task priority changed to ${newPriority}`,
    });
  };

  const handleAssigneeChange = (userId: string) => {
    setAssigneeId(userId);
    const assignee = userId ? users.find(u => u.id === userId) || null : null;
    const updatedTask = { 
      ...task, 
      assignee,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateTask(updatedTask);
    toast({
      title: "Assignee Updated",
      description: assignee ? `Task assigned to ${assignee.name}` : "Task unassigned",
    });
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await addComment(task.id, comment);
      
      if (success) {
        // The comment was added in the database, now update the local state
        // This refresh will happen when onUpdateTask is called
        toast({
          title: "Comment Added",
          description: "Your comment has been added to the task",
        });
        setComment("");
      } else {
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={task.status} colorClass={getStatusColor(task.status)} />
            <StatusBadge status={task.priority} colorClass={getPriorityColor(task.priority)} />
          </div>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Comments</h3>
              <div className="space-y-3 mb-3">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 pt-3 border-t">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
                
                {task.comments.length === 0 && (
                  <p className="text-sm text-gray-500">No comments yet</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Add a comment..." 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button 
                  onClick={handleAddComment} 
                  className="h-10"
                  disabled={isSubmitting || !comment.trim()}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
            
            {task.attachments && task.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Attachments</h3>
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center gap-2 p-2 border rounded-md text-sm hover:bg-gray-50"
                    >
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="flex-1">{attachment.name}</span>
                      <span className="text-xs text-gray-500">
                        {(attachment.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Priority</h3>
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Assignee</h3>
              <Select value={assigneeId} onValueChange={handleAssigneeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <UserIcon className="h-4 w-4" />
              <span>Reporter: {task.reporter.name}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(task.createdAt)}</span>
            </div>
            
            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
