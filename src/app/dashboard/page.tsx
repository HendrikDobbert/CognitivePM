import { ProjectBrain } from "@/components/dashboard/project-brain";
import { MyTasks } from "@/components/dashboard/my-tasks";
import { RiskPrediction } from "@/components/dashboard/risk-prediction";
import { AutomatedSummaries } from "@/components/dashboard/automated-summaries";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <ProjectBrain />
        </div>
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
