import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { cookies }s from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    [key: string]: any;
}

// Data fetching function now uses Firestore
async function getProjects(uid: string): Promise<Project[]> {
    if (!uid) return [];
    const q = query(
        collection(db, "projects"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
    );
    
    try {
        const querySnapshot = await getDocs(q);
        const projectsData: Project[] = [];
        querySnapshot.forEach((doc) => {
          projectsData.push({ id: doc.id, ...doc.data() } as Project);
        });
        return projectsData;
    } catch (error) {
        console.error("Error fetching projects on server:", error);
        return [];
    }
}

async function getUserIdFromSessionCookie() {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) return null;
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

export default async function ProjectsPage() {
  const uid = await getUserIdFromSessionCookie();
  const projects = await getProjects(uid || "");

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
         <CreateProjectDialog />
       </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link href={`/dashboard/project/${project.id}`} key={project.id}>
            <Card className="h-full hover:bg-muted/50 transition-colors">
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
          </Link>
        ))}
        {projects.length === 0 && (
            <Card className="border-dashed flex items-center justify-center text-muted-foreground col-span-full h-64">
                <div className="text-center">
                    <p>You have no projects yet.</p>
                    <p className="text-sm">Click 'New Project' to get started.</p>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
}
