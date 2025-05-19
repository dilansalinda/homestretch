import type { Project, User, Phase, Task, Step, SelectableUser, ItemStatus } from '@/types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png?text=AW' },
  { id: 'user-2', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png?text=BB' },
  { id: 'user-3', name: 'Charlie Brown', avatarUrl: 'https://placehold.co/100x100.png?text=CB' },
];

export const mockSelectableUsers: SelectableUser[] = mockUsers.map(user => ({
  value: user.id,
  label: user.name,
}));

const createSteps = (taskId: string, count: number): Step[] => {
  const statuses: ItemStatus[] = ["completed", "in-progress", "pending", "delayed"];
  return Array.from({ length: count }, (_, i) => ({
    id: `${taskId}-step-${i + 1}`,
    name: `Step ${i + 1}`,
    description: `Detailed description for step ${i + 1} of task ${taskId.split('-task-')[1]}. This step involves critical path activities.`,
    status: statuses[i % statuses.length],
    order: i + 1,
    assignedUserId: mockUsers[i % mockUsers.length].id,
    estimatedDuration: `${Math.floor(Math.random() * 5) + 1} days`,
    startDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
    dependsOnStepId: i > 0 ? `${taskId}-step-${i}` : undefined,
  }));
};

const createTasks = (phaseId: string, count: number): Task[] => {
  const statuses: ItemStatus[] = ["completed", "in-progress", "pending", "delayed"];
  return Array.from({ length: count }, (_, i) => {
    const taskId = `${phaseId}-task-${i + 1}`;
    return {
      id: taskId,
      name: `Task ${i + 1}`,
      description: `Detailed description for task ${i + 1} in phase ${phaseId.split('-phase-')[1]}. This task is crucial for phase completion.`,
      status: statuses[i % statuses.length],
      order: i + 1,
      assignedUserId: mockUsers[i % mockUsers.length].id,
      estimatedDuration: `${Math.floor(Math.random() * 2) + 1} weeks`,
      startDate: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
      dependsOnTaskId: i > 0 ? `${phaseId}-task-${i}` : undefined,
      steps: createSteps(taskId, Math.floor(Math.random() * 3) + 2),
    };
  });
};

const createPhases = (projectId: string, count: number): Phase[] => {
  const phaseNames = ["Foundation", "Framing", "Exterior", "Interior Finishing", "Landscaping"];
  return Array.from({ length: count }, (_, i) => {
    const phaseId = `${projectId}-phase-${i + 1}`;
    return {
      id: phaseId,
      name: phaseNames[i % phaseNames.length] || `Phase ${i + 1}`,
      description: `This is the ${phaseNames[i % phaseNames.length] || `Phase ${i + 1}`} of the house building project. It includes all essential activities related to this stage.`,
      order: i + 1,
      tasks: createTasks(phaseId, Math.floor(Math.random() * 4) + 3),
    };
  });
};

export const mockProject: Project = {
  id: 'project-1',
  name: 'Dream House Build',
  projectStartDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // Approx 2 months ago
  projectEstimatedEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // Approx 6 months from now
  phases: createPhases('project-1', 4),
};
