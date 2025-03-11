
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks, getStatusColor, getPriorityColor, formatDate } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import TaskCard from "@/components/TaskCard";
import TaskDetailDialog from "@/components/TaskDetailDialog";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, CheckSquare, AlertTriangle, Clock, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Task, User } from "@/lib/data";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Get all tasks assigned to the current user
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const allTasks = getTasks();
    const assignedTasks = allTasks.filter(task => 
      task.assignee && task.assignee.id === currentUser.id
    );
    setMyTasks(assignedTasks);
    
    // Extract unique users from tasks for the assignee dropdown
    const uniqueUsers = Array.from(
      new Map(
        allTasks
          .flatMap(task => [
            task.assignee,
            task.reporter,
            ...task.comments.map(c => c.author),
            ...task.attachments.map(a => a.uploadedBy)
          ])
          .filter(Boolean)
          .map(user => [user!.id, user!])
      ).values()
    );
    setUsers(uniqueUsers);
  }, [currentUser, navigate]);

  // Filter tasks based on search and filters
  const filteredTasks = myTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo' || task.status === 'backlog');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const reviewTasks = filteredTasks.filter(task => task.status === 'review');
  const completedTasks = filteredTasks.filter(task => task.status === 'done');
  const urgentTasks = filteredTasks.filter(task => task.priority === 'urgent' || task.priority === 'high');

  // Handle task update
  const handleUpdateTask = (updatedTask: Task) => {
    const taskIndex = myTasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex >= 0) {
      const updatedTasks = [...myTasks];
      updatedTasks[taskIndex] = updatedTask;
      setMyTasks(updatedTasks);
    }
  };

  // Open task details dialog
  const handleOpenTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  return (
    <div className="container px-6 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-gray-500 mt-1">Manage all your assigned tasks</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">To Do</p>
                <h3 className="text-3xl font-bold mt-1">{todoTasks.length}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <h3 className="text-3xl font-bold mt-1">{inProgressTasks.length}</h3>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <h3 className="text-3xl font-bold mt-1">{completedTasks.length}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Urgent Tasks</p>
                <h3 className="text-3xl font-bold mt-1">{urgentTasks.length}</h3>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tasks Board */}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-sm">To Do ({todoTasks.length})</h3>
              <div className="space-y-3">
                {todoTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => handleOpenTaskDetails(task)}
                  />
                ))}
                {todoTasks.length === 0 && 
                  <Card className="glass-card">
                    <CardContent className="p-3 text-center text-sm text-gray-500">
                      No tasks
                    </CardContent>
                  </Card>
                }
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm">In Progress ({inProgressTasks.length})</h3>
              <div className="space-y-3">
                {inProgressTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => handleOpenTaskDetails(task)}
                  />
                ))}
                {inProgressTasks.length === 0 && 
                  <Card className="glass-card">
                    <CardContent className="p-3 text-center text-sm text-gray-500">
                      No tasks
                    </CardContent>
                  </Card>
                }
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Review ({reviewTasks.length})</h3>
              <div className="space-y-3">
                {reviewTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => handleOpenTaskDetails(task)}
                  />
                ))}
                {reviewTasks.length === 0 && 
                  <Card className="glass-card">
                    <CardContent className="p-3 text-center text-sm text-gray-500">
                      No tasks
                    </CardContent>
                  </Card>
                }
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Completed ({completedTasks.length})</h3>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => handleOpenTaskDetails(task)}
                  />
                ))}
                {completedTasks.length === 0 && 
                  <Card className="glass-card">
                    <CardContent className="p-3 text-center text-sm text-gray-500">
                      No tasks
                    </CardContent>
                  </Card>
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={isTaskDetailOpen}
          onOpenChange={setIsTaskDetailOpen}
          users={users}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
