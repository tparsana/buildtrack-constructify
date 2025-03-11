
import { useParams, useNavigate } from "react-router-dom";
import { getProject, getStatusColor, formatDate, formatCurrency, calculateDaysRemaining } from "@/lib/data";
import ProjectTimeline from "@/components/ProjectTimeline";
import TaskCard from "@/components/TaskCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, MapPin, Users, User, DollarSign, ChevronRight, CheckSquare, Clock, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = getProject(id || "");

  if (!project) {
    return (
      <div className="container px-6 py-8 flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <p className="text-gray-500 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(project.endDate);
  const inProgressTasks = project.tasks.filter(t => t.status === 'in-progress');
  const todoTasks = project.tasks.filter(t => t.status === 'todo');
  const completedTasks = project.tasks.filter(t => t.status === 'done');
  
  return (
    <div className="container px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        <StatusBadge status={project.status} colorClass={getStatusColor(project.status)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-6">{project.description}</p>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2 mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Timeline</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className={`font-medium ${daysRemaining < 30 ? 'text-orange-500' : ''}`}>
                        {daysRemaining} days remaining
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-gray-500">{project.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Team ({project.team.length})</p>
                    <div className="flex -space-x-2 mt-1">
                      {project.team.map((member) => (
                        <Avatar key={member.id} className="h-7 w-7 border-2 border-white">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <p className="text-sm text-gray-500">{project.client}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 md:col-span-2">
                  <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="w-full">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Budget</p>
                      <p className="text-sm">
                        <span className="font-medium">{formatCurrency(project.budget.spent)}</span> 
                        <span className="text-gray-500"> of {formatCurrency(project.budget.total)}</span>
                      </p>
                    </div>
                    <Progress 
                      value={(project.budget.spent / project.budget.total) * 100} 
                      className="h-2 mt-2" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-0">
              <ProjectTimeline tasks={project.tasks} />
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-0">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-xl">Tasks</CardTitle>
                    <Button size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-sm">To Do ({todoTasks.length})</h3>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {todoTasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                        {todoTasks.length === 0 && 
                          <p className="text-center text-sm text-gray-500 p-4">No tasks</p>
                        }
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-sm">In Progress ({inProgressTasks.length})</h3>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {inProgressTasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                        {inProgressTasks.length === 0 && 
                          <p className="text-center text-sm text-gray-500 p-4">No tasks</p>
                        }
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-sm">Completed ({completedTasks.length})</h3>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {completedTasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                        {completedTasks.length === 0 && 
                          <p className="text-center text-sm text-gray-500 p-4">No tasks</p>
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="files" className="mt-0">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-xl">Files & Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-10">No files uploaded yet</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tasks</p>
                    <p className="text-2xl font-bold">{project.tasks.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Team Members</p>
                    <p className="text-2xl font-bold">{project.team.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Days Remaining</p>
                    <p className="text-2xl font-bold">{daysRemaining}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.assignee?.avatar || ''} alt={task.assignee?.name || ''} />
                      <AvatarFallback>{task.assignee?.name.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {task.assignee?.name || 'Unassigned'} 
                        <span className="font-normal text-gray-500"> updated task </span>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(task.updatedAt)}</p>
                    </div>
                  </div>
                ))}
                {project.tasks.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Project;
