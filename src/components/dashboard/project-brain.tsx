"use client";

import { useState, useRef, useEffect } from "react";
import { ragQuery } from "@/ai/flows/rag-flow";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, Send, Sparkles, User } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ProjectBrain() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await ragQuery(input);
      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error querying RAG flow:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I had trouble getting an answer. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <Card className="h-full max-h-[40rem] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          Project Brain
        </CardTitle>
        <CardDescription>
          Ask me anything about your projects. I'll provide answers based on the latest data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <p className="font-medium">Welcome to your Project Brain.</p>
                    <p className="text-sm">Ask a question to get started, e.g., "What is the status of Project Alpha?"</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 border-2 border-primary">
                        <AvatarFallback><Sparkles /></AvatarFallback>
                    </Avatar>
                )}
                <div className={`rounded-lg p-3 max-w-[80%] text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p>{message.content}</p>
                </div>
                 {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL ?? ''} />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                )}
              </div>
            ))}
             {loading && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                        <AvatarFallback><Sparkles /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
             )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="e.g., What are the risks for Project Alpha?"
            className="flex-1 resize-none"
            minRows={1}
            maxRows={5}
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
