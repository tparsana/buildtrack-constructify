
import { Task } from "@/lib/data";
import { formatDate } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectTimelineProps {
  tasks: Task[];
}

const ProjectTimeline = ({ tasks }: ProjectTimelineProps) => {
  // Sort tasks by created date
  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl">Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {sortedTasks.map((task, index) => (
            <div key={task.id} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                {index < sortedTasks.length - 1 && (
                  <div className="w-0.5 bg-gray-200 h-full mt-1"></div>
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="text-xs text-gray-500 mb-1">
                  {formatDate(task.createdAt)}
                </div>
                <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
              </div>
            </div>
          ))}
          
          {sortedTasks.length === 0 && (
            <p className="text-sm text-gray-500 py-4">No tasks available for timeline view</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
