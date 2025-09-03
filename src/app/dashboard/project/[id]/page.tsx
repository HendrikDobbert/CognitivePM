import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GanttChartSquare, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const tasks = [
    { id: 1, text: "Design homepage mockups", completed: true },
    { id: 2, text: "Develop authentication API", completed: true },
    { id: 3, text: "Integrate payment gateway", completed: false },
    { id: 4, text: "Setup deployment pipeline", completed: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Project Alpha</h1>
      <p className="text-muted-foreground">Detailed view for project ID: {params.id}</p>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GanttChartSquare className="w-6 h-6 text-primary" />
                Project Overview
              </CardTitle>
              <CardDescription>Timeline and milestone visualization.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50">
                <p className="text-muted-foreground">[Gantt Chart Placeholder]</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-6 h-6 text-primary" />
                Project Tasks
              </CardTitle>
              <CardDescription>Tasks specific to this project.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li key={task.id} className="flex justify-between items-center">
                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                      {task.text}
                    </span>
                    <Badge variant={task.completed ? "secondary" : "default"}>
                      {task.completed ? "Done" : "To-Do"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
