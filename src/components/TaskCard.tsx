
import { Task } from "@/lib/data";
import { formatDate, getStatusColor, getPriorityColor } from "@/lib/data";
import StatusBadge from "./StatusBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  return (
    <Card 
      className="glass-card hover:shadow-md transition-all duration-300 overflow-hidden animate-slide-in-bottom cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-base line-clamp-1">{task.title}</h3>
          <StatusBadge status={task.status} colorClass={getStatusColor(task.status)} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{task.description}</p>
        <div className="flex gap-2 mt-2">
          <StatusBadge status={task.priority} colorClass={getPriorityColor(task.priority)} />
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatDate(task.createdAt)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
