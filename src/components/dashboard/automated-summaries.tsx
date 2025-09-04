"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Summary {
  projectName: string;
  summary: string;
}

export function AutomatedSummaries() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummaries() {
      try {
        const response = await fetch("/api/summaries");
        if (!response.ok) {
          throw new Error("Failed to fetch summaries");
        }
        const data = await response.json();
        setSummaries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchSummaries();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Automated Summaries
        </CardTitle>
        <CardDescription>
          AI-powered summaries of your projects, updated in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-full" />
            </div>
          </>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : summaries.length > 0 ? (
          summaries.map((s, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold">{s.projectName}</h4>
                <Badge variant="outline">Updated now</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{s.summary}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No project summaries available. Add tasks to your projects to see summaries here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
