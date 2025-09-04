"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import TextareaAutosize from "react-textarea-autosize";

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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { smartTask } from "@/ai/flows/smart-task-flow";

export function NewTaskDialog({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);

  const handleGenerateTasks = async () => {
    if (prompt.trim() === "" || !user) {
      toast({
        variant: "destructive",
        title: "Prompt cannot be empty",
      });
      return;
    }
    setLoading(true);
    setGeneratedTasks([]);
    try {
      const result = await smartTask(prompt);
      setGeneratedTasks(result.tasks);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to generate tasks",
        description: "The AI model might be busy. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTasks = async () => {
    if (generatedTasks.length === 0 || !user) {
      toast({
        variant: "destructive",
        title: "No tasks to create",
      });
      return;
    }
    setLoading(true);
    try {
      const promises = generatedTasks.map((taskText) => {
        return addDoc(collection(db, "tasks"), {
          text: taskText,
          completed: false,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      });
      await Promise.all(promises);
      toast({
        title: `${generatedTasks.length} tasks created successfully!`,
      });
      setPrompt("");
      setGeneratedTasks([]);
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create tasks",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedTasks([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            handleReset();
        }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Smart Task Creation</DialogTitle>
          <DialogDescription>
            Describe what you want to achieve, and the AI will break it down into actionable tasks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-prompt">Your Goal</Label>
            <TextareaAutosize
              id="task-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Launch the new marketing campaign for Q3"
              minRows={3}
              maxRows={8}
            />
          </div>
          {generatedTasks.length > 0 && (
            <div className="space-y-2">
                <Label>Generated Tasks</Label>
                <div className="space-y-2 rounded-md border p-4">
                    {generatedTasks.map((task, index) => (
                        <p key={index} className="text-sm">- {task}</p>
                    ))}
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {generatedTasks.length === 0 ? (
            <Button onClick={handleGenerateTasks} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Tasks
          </Button>
          ) : (
            <>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
                Reset
            </Button>
            <Button onClick={handleCreateTasks} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create {generatedTasks.length} Tasks
            </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
