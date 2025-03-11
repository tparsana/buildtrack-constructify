import { useState, useEffect } from "react";
import { getStatusColor, getUsers } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";
import { Project } from "@/lib/data";
import ProjectCard from "@/components/ProjectCard";
import StatusBadge from "@/components/StatusBadge";
import NewProjectDialog from "@/components/NewProjectDialog";
import NewTaskDialog from "@/components/NewTaskDialog";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Search, Plus, Building, CheckSquare, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/projectUtils";
import { fetchTasks, addTask } from "@/lib/taskUtils";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const users = getUsers();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent').length;

  const handleAddProject = async (project: Project) => {
    try {
      const success = await addProject(project);
      if (success) {
        toast({
          title: "Project Created",
          description: `${project.name} has been successfully created`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to create project",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleAddTask = async (task: any) => {
    try {
      const success = await addTask(task);
      if (success) {
        toast({
          title: "Task Created",
          description: `${task.title} has been successfully created`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      return false;
    }
  };

  if (isLoadingProjects || isLoadingTasks) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container px-6 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your construction projects</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search projects..." 
              className="pl-10 w-[250px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <NewProjectDialog
            onAddProject={handleAddProject}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <h3 className="text-3xl font-bold mt-1">{activeProjects}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <StatusBadge status="active" colorClass={getStatusColor('active')} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <h3 className="text-3xl font-bold mt-1">{totalTasks}</h3>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="text-green-600 font-medium">{completedTasks}</span> tasks completed
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Deadlines</p>
                <h3 className="text-3xl font-bold mt-1">8</h3>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Within the next <span className="font-medium">7 days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Urgent Tasks</p>
                <h3 className="text-3xl font-bold mt-1">{urgentTasks}</h3>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <StatusBadge status="urgent" colorClass="bg-red-100 text-red-800" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Projects</h2>
          <NewTaskDialog
            projects={projects}
            users={users}
            onAddTask={handleAddTask}
            trigger={
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => navigate(`/project/${project.id}`)}
            />
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No projects found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const addProject = async (project: Project): Promise<boolean> => {
  try {
    const { currentUser } = useAuth.getState();
    if (!currentUser) return false;

    const { supabase } = await import("@/integrations/supabase/client");

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        client: project.client,
        location: project.location,
        status: project.status,
        progress: project.progress,
        budget_total: project.budget.total,
        budget_spent: project.budget.spent,
        start_date: project.startDate,
        end_date: project.endDate,
        lead_id: currentUser.id
      })
      .select('*')
      .single();

    if (projectError) throw projectError;

    if (projectData) {
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectData.id,
          user_id: currentUser.id
        });

      if (memberError) throw memberError;
    }

    return true;
  } catch (error) {
    console.error("Error adding project:", error);
    return false;
  }
};

export default Index;
