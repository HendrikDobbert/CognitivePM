"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { extractTaskDetails } from "@/ai/flows/extract-task-details-flow";

interface TaskDetails {
  title: string;
  description: string;
  dueDate?: Date;
}

export function NewTaskDialog({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [taskDetails, setTaskDetails] = useState<TaskDetails>({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async () => {
    if (prompt.trim() === "") {
      toast({
        variant: "destructive",
        title: "Prompt cannot be empty",
      });
      return;
    }
    setIsExtracting(true);
    try {
      const result = await extractTaskDetails(prompt);
      setTaskDetails({
        title: result.title,
        description: result.description,
        dueDate: result.dueDate ? new Date(result.dueDate) : undefined,
      });
      toast({
        title: "Task details extracted!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to extract details",
        description: "The AI model might be busy. Please try again later.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateTask = async () => {
    if (taskDetails.title.trim() === "" || !user) {
      toast({
        variant: "destructive",
        title: "Title is required",
      });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        ...taskDetails,
        dueDate: taskDetails.dueDate ? taskDetails.dueDate.toISOString() : null,
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Task created successfully!",
      });
      handleReset();
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

  const handleReset = () => {
    setPrompt("");
    setTaskDetails({ title: "", description: "" });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        handleReset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below, or use the Smart Create feature to have AI do it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="smart-prompt">Smart Create</Label>
                <div className="flex gap-2">
                    <Input
                        id="smart-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Schedule a meeting with the design team for next Tuesday"
                    />
                    <Button onClick={handleExtract} disabled={isExtracting} variant="outline" size="icon">
                        {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={taskDetails.title}
                    onChange={(e) => setTaskDetails({ ...taskDetails, title: e.target.value })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={taskDetails.description}
                    onChange={(e) => setTaskDetails({ ...taskDetails, description: e.target.value })}
                    minRows={3}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "justify-start text-left font-normal",
                            !taskDetails.dueDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {taskDetails.dueDate ? format(taskDetails.dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={taskDetails.dueDate}
                        onSelect={(date) => setTaskDetails({ ...taskDetails, dueDate: date as Date })}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTask} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
