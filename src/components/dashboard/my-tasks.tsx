"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import dynamic from "next/dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ListTodo, Sparkles, RefreshCw } from "lucide-react";

const NewTaskDialog = dynamic(
  () => import("./new-task-dialog").then((mod) => mod.NewTaskDialog),
  {
    ssr: false,
    loading: () => <Button variant="outline" size="sm" disabled>
        <Sparkles className="mr-2 h-4 w-4" />
        Smart Create
    </Button>,
  }
);


interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    try {
      const querySnapshot = await getDocs(q);
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc: DocumentData) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
        setLoading(false);
        setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks();
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === "" || !user) return;
    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        text: newTaskText,
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTasks([{id: docRef.id, text: newTaskText, completed: false}, ...tasks]);
      setNewTaskText("");
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    const taskDoc = doc(db, "tasks", id);
    await updateDoc(taskDoc, { completed: !completed });
    setTasks(tasks.map(t => t.id === id ? {...t, completed: !completed} : t));
  };

  const handleDeleteTask = async (id: string) => {
    const taskDoc = doc(db, "tasks", id);
    await deleteDoc(taskDoc);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6" />
            My Tasks
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing || loading}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
             </Button>
            <NewTaskDialog>
               <Button variant="outline" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Smart Create
              </Button>
            </NewTaskDialog>
          </div>
        </CardTitle>
        <CardDescription>
          You have {pendingTasks} pending and {completedTasks} completed tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          {loading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 text-sm ${
                      task.completed ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {task.text}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <p className="font-medium">All tasks completed!</p>
                <p className="text-sm">Add a new task to get started or click refresh.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
