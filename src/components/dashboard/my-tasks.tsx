"use client";

import { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
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
import { Plus, Trash2, ListTodo, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

interface MyTasksProps {
    initialTasks: Task[];
}

export function MyTasks({ initialTasks }: MyTasksProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskText, setNewTaskText] = useState("");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === "" || !user) return;
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = { id: tempId, text: newTaskText, completed: false };
    setTasks([newTask, ...tasks]);
    setNewTaskText("");

    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        text: newTaskText,
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      // Replace temporary task with the one from Firestore
      setTasks(currentTasks => currentTasks.map(t => t.id === tempId ? { ...newTask, id: docRef.id } : t));
    } catch (error) {
      console.error("Error adding task: ", error);
      // Revert optimistic update on error
      setTasks(currentTasks => currentTasks.filter(t => t.id !== tempId));
    }
  };

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
            disabled={!user}
          />
          <Button type="submit" size="icon" disabled={!user}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <AnimatePresence>
            {tasks.length > 0 ? (
              <motion.div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`flex-1 text-sm transition-colors ${
                        task.completed
                          ? "text-muted-foreground line-through"
                          : ""
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
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8"
              >
                <p className="font-medium">All tasks completed!</p>
                <p className="text-sm">Add a new task to get started.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
