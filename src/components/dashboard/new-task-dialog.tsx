"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function NewTaskDialog({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    if (taskText.trim() === "" || !user) {
      toast({
        variant: "destructive",
        title: "Task cannot be empty",
      });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        text: taskText,
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Task created successfully!",
      });
      setTaskText("");
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list. Keep it short and actionable.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-name" className="text-right">
              Task
            </Label>
            <Input
              id="task-name"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Finalize project proposal"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateTask} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
