
import { Project } from "@/lib/data";
import { formatDate, getStatusColor, formatCurrency, calculateDaysRemaining } from "@/lib/data";
import StatusBadge from "./StatusBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, User, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const daysRemaining = project.endDate ? calculateDaysRemaining(project.endDate) : 0;

  return (
    <Card 
      className="glass-card h-full overflow-hidden animate-slide-in-bottom cursor-pointer hover:shadow-md transition-all duration-300"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{project.name}</h3>
          <StatusBadge status={project.status} colorClass={getStatusColor(project.status)} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(project.startDate)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              {project.endDate ? formatDate(project.endDate) : 'N/A'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="h-3.5 w-3.5" />
              {project.lead.name}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" />
              {project.team.length} members
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 col-span-2">
              <MapPin className="h-3.5 w-3.5" />
              {project.location}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between border-t mt-2 pt-3">
        <div className="text-xs">
          <span className="text-gray-500">Budget: </span>
          <span className="font-medium">
            {formatCurrency(project.budget.spent)} / {formatCurrency(project.budget.total)}
          </span>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">Remaining: </span>
          <span className={`font-medium ${daysRemaining < 30 ? 'text-orange-500' : ''}`}>
            {daysRemaining} days
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
