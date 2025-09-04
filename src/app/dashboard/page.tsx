import { cookies } from "next/headers";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminAuth } from "@/lib/firebase-admin";

import { ProjectBrain } from "@/components/dashboard/project-brain";
import { MyTasks } from "@/components/dashboard/my-tasks";
import { RiskPrediction } from "@/components/dashboard/risk-prediction";
import { AutomatedSummaries } from "@/components/dashboard/automated-summaries";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  [key: string]: any;
}

async function getTasksForUser(uid: string): Promise<Task[]> {
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  
  try {
    const querySnapshot = await getDocs(q);
    const tasksData: Task[] = [];
    querySnapshot.forEach((doc: DocumentData) => {
      tasksData.push({ id: doc.id, ...doc.data() } as Task);
    });
    return tasksData;
  } catch (error) {
    console.error("Error fetching tasks on server:", error);
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
    // Session cookie is invalid or expired.
    return null;
  }
}

export default async function DashboardPage() {
  const uid = await getUserIdFromSessionCookie();
  const initialTasks = uid ? await getTasksForUser(uid) : [];

  return (
    <div className="space-y-6">
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <ProjectBrain />
        </div>
        <div className="lg:col-span-2">
          <MyTasks initialTasks={initialTasks} />
        </div>
        <div className="space-y-6">
          <RiskPrediction />
          <AutomatedSummaries />
        </div>
      </div>
    </div>
  );
}
