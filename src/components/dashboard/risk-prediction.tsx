import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, TrendingUp, TrendingDown, GanttChartSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const risks = [
  {
    title: "Budget Overrun",
    level: "High",
    variant: "destructive",
    icon: TrendingUp,
    details: "Projected 20% over budget",
  },
  {
    title: "Timeline Delay",
    level: "Medium",
    variant: "secondary",
    icon: GanttChartSquare,
    details: "Critical path at risk",
  },
  {
    title: "Resource Burnout",
    level: "Low",
    variant: "outline",
    icon: TrendingDown,
    details: "Team velocity is stable",
  },
];

export function RiskPrediction() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          Risk Prediction
        </CardTitle>
        <CardDescription>AI-powered risk analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {risks.map((risk) => (
            <div key={risk.title} className="flex items-start gap-4">
              <risk.icon className="h-5 w-5 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{risk.title}</p>
                  <Badge variant={risk.variant as any}>{risk.level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{risk.details}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
