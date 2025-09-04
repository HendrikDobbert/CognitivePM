import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GanttChartSquare, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { doc, getDoc, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

// In a real app, you might want to type this more strictly
interface ProjectDetails {
  name: string;
  description: string;
  status: string;
  tasks: any[]; // Assuming tasks might be stored or handled differently
  [key: string]: any;
}

// Function to get a single project from Firestore
async function getProjectDetails(id: string): Promise<ProjectDetails | null> {
  try {
    const projectDoc = await getDoc(doc(db, "projects", id));
    if (projectDoc.exists()) {
      // For now, tasks are mocked as they are on a separate collection
      // In a real app, you would fetch tasks related to this project id
      const mockTasks = [
         { id: 1, text: "Design homepage mockups", completed: true },
         { id: 2, text: "Develop authentication API", completed: true },
         { id: 3, text: "Integrate payment gateway", completed: false },
      ];

      return {
        ...(projectDoc.data() as ProjectDetails),
        tasks: mockTasks,
      };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProjectDetails(params.id);

  if (!project) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Project not found</h1>
        <p className="text-muted-foreground">
          Could not find a project with ID: {params.id}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
        </div>
        <Badge variant="outline" className="text-base">{project.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GanttChartSquare className="w-6 h-6 text-primary" />
                Project Overview
              </CardTitle>
              <CardDescription>
                Timeline and milestone visualization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50">
                <p className="text-muted-foreground">
                  [Gantt Chart Placeholder]
                </p>
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
                {project.tasks.map((task: any) => (
                  <li
                    key={task.id}
                    className="flex justify-between items-center"
                  >
                    <span
                      className={
                        task.completed ? "line-through text-muted-foreground" : ""
                      }
                    >
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
