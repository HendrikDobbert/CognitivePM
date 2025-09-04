"use client";

import { useState } from "react";
import {
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import dynamic from "next/dynamic";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListTodo, Sparkles, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
}

interface MyTasksProps {
    initialTasks: Task[];
}

export function MyTasks({ initialTasks }: MyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleToggleTask = async (id: string, completed: boolean) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === id ? {...t, completed: !completed} : t));

    try {
        const taskDoc = doc(db, "tasks", id);
        await updateDoc(taskDoc, { completed: !completed });
    } catch (error) {
        console.error("Error toggling task: ", error);
        // Revert optimistic update
        setTasks(tasks.map(t => t.id === id ? {...t, completed: completed} : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const originalTasks = tasks;
    // Optimistic UI update
    setTasks(tasks.filter(t => t.id !== id));
    try {
        const taskDoc = doc(db, "tasks", id);
        await deleteDoc(taskDoc);
    } catch(error) {
        console.error("Error deleting task: ", error);
        // Revert optimistic update
        setTasks(originalTasks);
    }
  };

  // This is a client component, so we need to update the tasks state
  // if the initialTasks prop changes.
  useState(() => {
    setTasks(initialTasks);
  });

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
          <NewTaskDialog>
              <Button variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Smart Create
              </Button>
          </NewTaskDialog>
        </CardTitle>
        <CardDescription>
          You have {pendingTasks} pending and {completedTasks} completed tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4">
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-md transition-colors border hover:bg-muted/50"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    className="mt-1"
                  />
                  <div className="flex-1 grid gap-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`font-medium ${
                        task.completed ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {task.title}
                    </label>
                    {task.description && (
                         <p className={`text-sm text-muted-foreground ${
                            task.completed ? "line-through" : ""
                          }`}>{task.description}</p>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(task.dueDate), "PPP")}</span>
                        </div>
                    )}
                  </div>
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
                <p className="font-medium">No tasks yet!</p>
                <p className="text-sm">Click "Smart Create" to add a new task.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
