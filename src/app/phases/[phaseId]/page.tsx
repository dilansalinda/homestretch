"use client";

import { useState, useEffect } from "react";
import { useParams, notFound, useRouter }  from "next/navigation";
import type { Phase, Task, Step, SelectableUser, ItemStatus } from "@/types";
import { mockProject, mockSelectableUsers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle, Edit3, Trash2, Wand2, MoreVertical, Eye, CheckSquare, ListChecks, Users, CalendarDays } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DurationEstimatorDialog } from "@/components/ai/DurationEstimatorDialog";
import type { EstimateDurationOutput } from "@/ai/flows/estimate-duration";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { format, parseISO } from 'date-fns';


// Placeholder for Task/Step Forms - ideally these would be separate components
interface TaskStepFormProps {
  type: "task" | "step";
  initialData?: Partial<Task> | Partial<Step>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void; 
  onCancel: () => void;
  isLoading: boolean;
  phaseTasks?: Task[]; // For task dependencies
  taskSteps?: Step[]; // For step dependencies
  currentPhaseId?: string;
  currentTaskId?: string;
}

function TaskStepForm({ type, initialData, onSubmit, onCancel, isLoading, phaseTasks, taskSteps, currentTaskId }: TaskStepFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [assignedUserId, setAssignedUserId] = useState(initialData?.assignedUserId || "");
  const [estimatedDuration, setEstimatedDuration] = useState(initialData?.estimatedDuration || "");
  const [status, setStatus] = useState<ItemStatus>(initialData?.status || "pending");
  const [dependsOnId, setDependsOnId] = useState(
    type === 'task' ? (initialData as Task)?.dependsOnTaskId || "" : (initialData as Step)?.dependsOnStepId || ""
  );
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, assignedUserId, estimatedDuration, status, dependsOnId });
  };
  
  const handleEstimateGenerated = (estimate: EstimateDurationOutput) => {
    setEstimatedDuration(estimate.durationEstimate);
    // Optionally store reasoning: (initialData as any).aiReasoning = estimate.reasoning;
  };
  
  const dependencyOptions = type === 'task' 
    ? (phaseTasks || []).filter(task => task.id !== initialData?.id)
    : (taskSteps || []).filter(step => step.id !== initialData?.id && step.id.startsWith(currentTaskId || ''));


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{type === "task" ? "Task" : "Step"} Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignedUser">Assign To</Label>
          <Select value={assignedUserId} onValueChange={setAssignedUserId}>
            <SelectTrigger id="assignedUser"><SelectValue placeholder="Select user" /></SelectTrigger>
            <SelectContent>
              {mockSelectableUsers.map(user => <SelectItem key={user.value} value={user.value}>{user.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ItemStatus)}>
            <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              {(["pending", "in-progress", "completed", "delayed"] as ItemStatus[]).map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="estimatedDuration">Estimated Duration</Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsEstimatorOpen(true)}>
            <Wand2 className="mr-1 h-3 w-3" /> AI Estimate
          </Button>
        </div>
        <Input id="estimatedDuration" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} placeholder="e.g., 3 days, 1 week" />
      </div>
       {dependencyOptions.length > 0 && (
        <div>
          <Label htmlFor="dependsOn">Depends On (Optional)</Label>
          <Select value={dependsOnId} onValueChange={setDependsOnId}>
            <SelectTrigger id="dependsOn">
              <SelectValue placeholder={`Select prerequisite ${type}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {dependencyOptions.map(item => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
      </DialogFooter>
      <DurationEstimatorDialog
        open={isEstimatorOpen}
        onOpenChange={setIsEstimatorOpen}
        onEstimateGenerated={handleEstimateGenerated}
        itemName={name || `New ${type}`}
        initialDescription={description}
      />
    </form>
  );
}


export default function PhaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const phaseId = params.phaseId as string;

  const [phase, setPhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Task> | Partial<Step> | null>(null);
  const [modalType, setModalType] = useState<"task" | "step" | null>(null);
  const [currentParentTaskId, setCurrentParentTaskId] = useState<string | null>(null); // For adding/editing steps

  useEffect(() => {
    // Simulate fetching phase data
    const foundPhase = mockProject.phases.find(p => p.id === phaseId);
    if (foundPhase) {
      setPhase(foundPhase);
    } else {
      // If not found after timeout, treat as 404
      setTimeout(() => {
        if (!phase) notFound();
      }, 1000);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  const handleFormSubmit = (data: Partial<Task & Step>) => {
    // This is a simplified mock of CRUD. In a real app, this would update a store/backend.
    console.log("Form submitted", modalType, data);
    if (modalType === 'task') {
      if (editingItem?.id) { // Editing task
        setPhase(p => p ? ({ ...p, tasks: p.tasks.map(t => t.id === editingItem.id ? {...t, ...data} as Task : t) }) : null);
        toast({ title: "Task Updated", description: `Task "${data.name}" updated.`});
      } else { // Adding new task
        const newTask: Task = { ...data, id: `task-${Date.now()}`, order: (phase?.tasks.length || 0) + 1, steps: [] } as Task;
        setPhase(p => p ? ({ ...p, tasks: [...p.tasks, newTask] }) : null);
        toast({ title: "Task Added", description: `Task "${data.name}" added.`});
      }
    } else if (modalType === 'step' && currentParentTaskId) {
       if (editingItem?.id) { // Editing step
         setPhase(p => p ? ({ ...p, tasks: p.tasks.map(t => t.id === currentParentTaskId ? ({...t, steps: t.steps.map(s => s.id === editingItem.id ? {...s, ...data} as Step : s)}) : t)}) : null);
         toast({ title: "Step Updated", description: `Step "${data.name}" updated.`});
       } else { // Adding new step
         const newStep: Step = { ...data, id: `step-${Date.now()}`, order: (phase?.tasks.find(t=>t.id === currentParentTaskId)?.steps.length || 0) + 1 } as Step;
         setPhase(p => p ? ({ ...p, tasks: p.tasks.map(t => t.id === currentParentTaskId ? ({...t, steps: [...t.steps, newStep]}) : t)}) : null);
         toast({ title: "Step Added", description: `Step "${data.name}" added.`});
       }
    }
    closeModal();
  };

  const openModal = (type: "task" | "step", itemData?: Partial<Task> | Partial<Step>, parentTaskId?: string) => {
    setModalType(type);
    setEditingItem(itemData || {});
    setCurrentParentTaskId(parentTaskId || null);
    if (type === "task") setIsTaskModalOpen(true);
    else setIsStepModalOpen(true);
  };

  const closeModal = () => {
    setIsTaskModalOpen(false);
    setIsStepModalOpen(false);
    setEditingItem(null);
    setModalType(null);
    setCurrentParentTaskId(null);
  };
  
  const handleDeleteTask = (taskId: string) => {
    setPhase(p => p ? ({ ...p, tasks: p.tasks.filter(t => t.id !== taskId) }) : null);
    toast({ title: "Task Deleted", description: "Task successfully deleted." });
  };

  const handleDeleteStep = (taskId: string, stepId: string) => {
     setPhase(p => p ? ({ ...p, tasks: p.tasks.map(t => t.id === taskId ? ({...t, steps: t.steps.filter(s => s.id !== stepId)}) : t)}) : null);
     toast({ title: "Step Deleted", description: "Step successfully deleted." });
  };


  if (isLoading) return <div className="flex justify-center items-center h-full"><ListChecks className="h-8 w-8 animate-spin text-primary" /> Loading phase details...</div>;
  if (!phase) return notFound();

  const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = phase.tasks.length;
  const phaseProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/phases')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Phases
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{phase.name}</CardTitle>
              <CardDescription className="mt-1">{phase.description || "No phase description."}</CardDescription>
            </div>
             <Button onClick={() => openModal('task')}><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground">Phase Progress</span>
                <span className="text-sm font-semibold text-primary">{phaseProgress}%</span>
            </div>
            <Progress value={phaseProgress} aria-label={`${phase.name} progress`} className="h-3" />
          </div>
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-semibold">Tasks</h2>
      {phase.tasks.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No tasks in this phase yet.</p>
            <Button onClick={() => openModal('task')} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add First Task</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {phase.tasks.map(task => (
            <Card key={task.id} className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{task.name}</CardTitle>
                    <StatusBadge status={task.status} className="mt-1" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openModal('task', task)}><Edit3 className="mr-2 h-4 w-4" />Edit Task</DropdownMenuItem>
                      <ConfirmDeleteDialog 
                        triggerButton={<Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm text-destructive hover:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete Task</Button>}
                        itemName={task.name}
                        onConfirm={() => handleDeleteTask(task.id)}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {task.description && <CardDescription className="mt-2 text-sm">{task.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center"><Users className="h-3.5 w-3.5 mr-1"/> Assigned: {mockUsers.find(u=>u.id === task.assignedUserId)?.name || 'N/A'}</div>
                    <div className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1"/> Duration: {task.estimatedDuration || 'N/A'}</div>
                    <div className="flex items-center"><CheckSquare className="h-3.5 w-3.5 mr-1"/> Steps: {task.steps.length}</div>
                    {task.dependsOnTaskId && <div className="flex items-center"><ListChecks className="h-3.5 w-3.5 mr-1"/> Depends on: {phase.tasks.find(t => t.id === task.dependsOnTaskId)?.name || 'N/A'}</div>}
                 </div>

                <h4 className="font-semibold mb-2 mt-4 text-md">Steps:</h4>
                {task.steps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No steps for this task.</p>
                ) : (
                  <ul className="space-y-2 list-disc list-inside pl-1">
                    {task.steps.map(step => (
                      <li key={step.id} className="text-sm flex justify-between items-center group hover:bg-muted/50 p-1 rounded">
                        <div className="flex items-center">
                           <StatusBadge status={step.status} className="mr-2 text-xs py-0.5 px-1.5" />
                           <span>{step.name}</span>
                           {step.dependsOnStepId && <span className="text-xs text-muted-foreground ml-1">(depends on {task.steps.find(s=>s.id === step.dependsOnStepId)?.name || 'step'})</span>}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openModal('step', step, task.id)}><Edit3 className="h-3 w-3" /></Button>
                          <ConfirmDeleteDialog
                            triggerButton={<Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>}
                            itemName={step.name}
                            onConfirm={() => handleDeleteStep(task.id, step.id)}
                           />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="outline" size="sm" onClick={() => openModal('step', {}, task.id)} className="mt-3">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Step
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? "Edit Task" : "Add New Task"}</DialogTitle>
            <DialogDescription>
              {editingItem?.id ? `Update details for task "${editingItem.name}".` : `Add a new task to phase "${phase.name}".`}
            </DialogDescription>
          </DialogHeader>
          <TaskStepForm 
            type="task" 
            initialData={editingItem as Task} 
            onSubmit={handleFormSubmit} 
            onCancel={closeModal} 
            isLoading={false} // Add loading state if async
            phaseTasks={phase.tasks}
          />
        </DialogContent>
      </Dialog>

      {/* Step Modal */}
      <Dialog open={isStepModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? "Edit Step" : "Add New Step"}</DialogTitle>
            <DialogDescription>
              {editingItem?.id ? `Update details for step "${editingItem.name}".` : `Add a new step to task "${phase.tasks.find(t => t.id === currentParentTaskId)?.name}".`}
            </DialogDescription>
          </DialogHeader>
          <TaskStepForm 
            type="step" 
            initialData={editingItem as Step} 
            onSubmit={handleFormSubmit} 
            onCancel={closeModal} 
            isLoading={false} // Add loading state if async
            taskSteps={phase.tasks.find(t=>t.id === currentParentTaskId)?.steps}
            currentTaskId={currentParentTaskId || undefined}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}
