import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AutomatedSummaries() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Automated Summaries
        </CardTitle>
        <CardDescription>Your daily project briefing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold">Project Alpha</h4>
                <Badge variant="outline">Updated 2h ago</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
            The design team has completed the new mockups. Development is blocked on API integration, which is currently 2 days behind schedule.
            </p>
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold">Project Phoenix</h4>
                 <Badge variant="outline">Updated 8h ago</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
            Successful deployment of v1.2 to staging. User feedback is positive. Next focus is on performance optimization.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
