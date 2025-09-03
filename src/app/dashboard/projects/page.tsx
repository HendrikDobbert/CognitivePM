import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    { name: "Project Alpha", description: "Mobile app development", status: "In Progress" },
    { name: "Project Phoenix", description: "Website redesign", status: "On Hold" },
    { name: "Project Neptune", description: "Data analytics platform", status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-primary" />
                {project.name}
              </CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Status: {project.status}</div>
            </CardContent>
          </Card>
        ))}
        <Card className="border-dashed flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <div className="text-center">
                <p>+ New Project</p>
            </div>
        </Card>
      </div>
    </div>
  );
}
