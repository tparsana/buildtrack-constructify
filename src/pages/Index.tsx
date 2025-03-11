
import { useState } from "react";
import { getProjects, getStatusColor, getUsers } from "@/lib/data";
import { useDataOperations } from "@/lib/dataUtils";
import ProjectCard from "@/components/ProjectCard";
import StatusBadge from "@/components/StatusBadge";
import NewProjectDialog from "@/components/NewProjectDialog";
import NewTaskDialog from "@/components/NewTaskDialog";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Search, Plus, Building, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { addProject, addTask } = useDataOperations();
  const projects = getProjects();
  const users = getUsers();

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate summary data
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalTasks = projects.reduce((total, project) => total + project.tasks.length, 0);
  const completedTasks = projects.reduce((total, project) => 
    total + project.tasks.filter(t => t.status === 'done').length, 0);
  const urgentTasks = projects.reduce((total, project) => 
    total + project.tasks.filter(t => t.priority === 'urgent').length, 0);

  // Handle adding a new project
  const handleAddProject = (project: any) => {
    addProject(project);
  };

  // Handle adding a new task
  const handleAddTask = (task: any) => {
    addTask(task);
  };

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

      {/* Summary Cards */}
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

      {/* Projects Section */}
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

export default Index;
