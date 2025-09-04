"use client";

import { Chart } from "react-google-charts";

const columns = [
  { type: "string", label: "Task ID" },
  { type: "string", label: "Task Name" },
  { type: "string", label: "Resource" },
  { type: "date", label: "Start Date" },
  { type: "date", label: "End Date" },
  { type: "number", label: "Duration" },
  { type: "number", label: "Percent Complete" },
  { type: "string", label: "Dependencies" },
];

const rows = [
  [
    "2024-q3-1",
    "Phase 1: Discovery",
    "Discovery",
    new Date(2024, 6, 1),
    new Date(2024, 6, 31),
    null,
    100,
    null,
  ],
  [
    "2024-q3-2",
    "Phase 2: Design",
    "Design",
    new Date(2024, 7, 1),
    new Date(2024, 7, 31),
    null,
    75,
    "2024-q3-1",
  ],
  [
    "2024-q4-1",
    "Phase 3: Development",
    "Development",
    new Date(2024, 8, 1),
    new Date(2024, 10, 30),
    null,
    25,
    "2024-q3-2",
  ],
  [
    "2025-q1-1",
    "Phase 4: Testing & QA",
    "Testing",
    new Date(2024, 11, 1),
    new Date(2025, 0, 31),
    null,
    0,
    "2024-q4-1",
  ],
    [
    "2025-q1-2",
    "Phase 5: Deployment",
    "Deployment",
    new Date(2025, 1, 1),
    new Date(2025, 1, 28),
    null,
    0,
    "2025-q1-1",
  ],
];

export const data = [columns, ...rows];

export function GanttChart() {
  return (
    <Chart
      chartType="Gantt"
      data={data}
      width="100%"
      height="100%"
      options={{
        height: 400,
        gantt: {
          trackHeight: 30,
        },
      }}
    />
  );
}
