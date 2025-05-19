
export type ItemStatus = "pending" | "in-progress" | "completed" | "delayed";

export interface User {
  id: string;
  name: string;
  avatarUrl?: string; // e.g., https://placehold.co/100x100.png
}

export interface Step {
  id: string;
  name: string;
  description?: string;
  status: ItemStatus;
  order: number;
  assignedUserId?: string;
  estimatedDuration?: string; // e.g., "3 days", "1 week"
  aiSuggestedDuration?: string;
  aiReasoning?: string;
  actualDuration?: string;
  startDate?: string; // ISO Date string
  endDate?: string; // ISO Date string
  dependsOnStepId?: string; // ID of another step in the same task
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: ItemStatus;
  order: number;
  assignedUserId?: string;
  estimatedDuration?: string;
  aiSuggestedDuration?: string;
  aiReasoning?: string;
  actualDuration?: string;
  startDate?: string; // ISO Date string
  endDate?: string; // ISO Date string
  dependsOnTaskId?: string; // ID of another task in the same phase
  steps: Step[];
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  order: number;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  phases: Phase[];
  // Overall project dates can be derived or set
  projectStartDate?: string;
  projectEstimatedEndDate?: string;
  projectActualEndDate?: string;
}

// For simpler user selection in forms
export interface SelectableUser {
  value: string; // userId
  label: string; // userName
}
