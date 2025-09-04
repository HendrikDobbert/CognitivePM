'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, TrendingUp, TrendingDown, GanttChartSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { riskPrediction, RiskPredictionOutput } from "@/ai/flows/risk-prediction-flow";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  [key: string]: any;
}

interface RiskPredictionProps {
  tasks: Task[];
}

const riskLevelToVariant: Record<string, "destructive" | "secondary" | "outline"> = {
  High: "destructive",
  Medium: "secondary",
  Low: "outline",
};

export function RiskPrediction({ tasks }: RiskPredictionProps) {
  const [prediction, setPrediction] = useState<RiskPredictionOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getPrediction() {
      if (!tasks.length) {
        setLoading(false);
        return;
      }

      // For this example, we'll just use the most recent task.
      const mostRecentTask = tasks[0];

      try {
        setLoading(true);
        const result = await riskPrediction({ title: mostRecentTask.text });
        setPrediction(result);
      } catch (e) {
        setError("Failed to predict risk.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    getPrediction();
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          Risk Prediction
        </CardTitle>
        <CardDescription>AI-powered risk analysis of your latest task</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="h-10 w-full" />}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && !prediction && (
          <p className="text-sm text-muted-foreground">No tasks to analyze.</p>
        )}
        {prediction && (
          <div className="flex items-start gap-4">
            <TrendingUp className="h-5 w-5 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-medium">{prediction.level} Risk</p>
                <Badge variant={riskLevelToVariant[prediction.level]}>{prediction.level}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{prediction.details}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
