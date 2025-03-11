
import { getTasks, getStatusColor, getPriorityColor } from "@/lib/data";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";

const Tasks = () => {
  const allTasks = getTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  
  // Filter tasks based on search, status, and priority
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "dueDate":
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "priority":
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      default:
        return 0;
    }
  });
  
  // Group tasks by status for the board view
  const todoTasks = sortedTasks.filter(task => task.status === 'todo' || task.status === 'backlog');
  const inProgressTasks = sortedTasks.filter(task => task.status === 'in-progress');
  const reviewTasks = sortedTasks.filter(task => task.status === 'review');
  const doneTasks = sortedTasks.filter(task => task.status === 'done');
  
  return (
    <div className="container px-6 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage all project tasks in one place</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
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
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue>
                <div className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="board" className="mb-8">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="board" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center justify-between">
                <span>To Do ({todoTasks.length})</span>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </h3>
              <div className="space-y-3">
                {todoTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
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
              <h3 className="font-medium text-sm flex items-center justify-between">
                <span>In Progress ({inProgressTasks.length})</span>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </h3>
              <div className="space-y-3">
                {inProgressTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
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
              <h3 className="font-medium text-sm flex items-center justify-between">
                <span>Review ({reviewTasks.length})</span>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </h3>
              <div className="space-y-3">
                {reviewTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
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
              <h3 className="font-medium text-sm flex items-center justify-between">
                <span>Done ({doneTasks.length})</span>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </h3>
              <div className="space-y-3">
                {doneTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {doneTasks.length === 0 && 
                  <Card className="glass-card">
                    <CardContent className="p-3 text-center text-sm text-gray-500">
                      No tasks
                    </CardContent>
                  </Card>
                }
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="space-y-3">
                {sortedTasks.length > 0 ? (
                  sortedTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-4 p-3 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{task.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                              {task.status.replace(/-/g, ' ')}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-gray-500">No tasks found matching your filters</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
