
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Project } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useDataOperations } from "@/lib/dataUtils";

interface RaiseTicketDialogProps {
  projects: Project[];
  currentProjectId?: string;
  trigger?: React.ReactNode;
  onTicketCreated?: () => void;
}

const RaiseTicketDialog = ({ 
  projects, 
  currentProjectId, 
  trigger,
  onTicketCreated
}: RaiseTicketDialogProps) => {
  const { currentUser } = useAuth();
  const { raiseTicket } = useDataOperations();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(currentProjectId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You need to be logged in to raise a ticket",
        variant: "destructive",
      });
      return;
    }
    
    // Validate form
    if (!title || !description || !projectId) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Raise the ticket
    const result = raiseTicket(title, description, projectId, currentUser.id);
    
    if (result.success) {
      // Reset form and close dialog
      setTitle("");
      setDescription("");
      if (!currentProjectId) setProjectId("");
      setOpen(false);
      
      // Notify parent component
      if (onTicketCreated) {
        onTicketCreated();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Raise Ticket</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Raise a Ticket</DialogTitle>
            <DialogDescription>
              Submit an urgent issue that requires immediate attention.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Issue Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            {!currentProjectId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project" className="text-right">
                  Project
                </Label>
                <Select value={projectId} onValueChange={setProjectId} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 min-h-[100px]"
                placeholder="Describe the issue in detail..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseTicketDialog;
