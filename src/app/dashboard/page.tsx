import { Button } from "@/components/ui/button";
import { MyTasks } from "@/components/dashboard/my-tasks";
import { RiskPrediction } from "@/components/dashboard/risk-prediction";
import { AutomatedSummaries } from "@/components/dashboard/automated-summaries";
import { NewTaskDialog } from "@/components/dashboard/new-task-dialog";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your project overview.
          </p>
        </div>
        <NewTaskDialog>
            <Button>Smart Create Task</Button>
        </NewTaskDialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MyTasks />
        </div>
        <div className="space-y-6">
          <RiskPrediction />
          <AutomatedSummaries />
        </div>
      </div>
    </div>
  );
}
