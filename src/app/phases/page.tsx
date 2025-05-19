"use client";

import { useState, useEffect } from "react";
import type { Phase } from "@/types";
import { mockProject } from "@/lib/mock-data";
import { AddPhaseDialog } from "@/components/phases/AddPhaseDialog";
import { PhaseListItem } from "@/components/phases/PhaseListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Layers, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { PhaseForm, type PhaseFormData } from "@/components/phases/PhaseForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PhasesPage() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setPhases(mockProject.phases.sort((a, b) => a.order - b.order));
      setIsLoading(false);
    }, 500);
  }, []);

  const handlePhaseAdded = (newPhase: Omit<Phase, 'id' | 'order' | 'tasks'> & { id: string; order: number; tasks: [] }) => {
    setPhases(prevPhases => [...prevPhases, newPhase].sort((a,b) => a.order - b.order));
  };
  
  const handleEdit = (phase: Phase) => {
    setEditingPhase(phase);
    setIsEditModalOpen(true);
  };

  const handleDelete = (phaseId: string) => {
    setPhases(prevPhases => prevPhases.filter(p => p.id !== phaseId));
    toast({
      title: "Phase Deleted",
      description: "The phase has been successfully deleted.",
    });
  };

  const handleEditSubmit = async (data: PhaseFormData) => {
    if (!editingPhase) return;
    setIsSubmittingEdit(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPhases(prevPhases => 
      prevPhases.map(p => p.id === editingPhase.id ? { ...p, ...data } : p)
    );
    setIsSubmittingEdit(false);
    setIsEditModalOpen(false);
    setEditingPhase(null);
    toast({
      title: "Phase Updated",
      description: `"${data.name}" has been successfully updated.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading phases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Phases</h1>
          <p className="text-muted-foreground">Manage and track the different phases of your house building project.</p>
        </div>
        <AddPhaseDialog onPhaseAdded={handlePhaseAdded} nextOrder={phases.length + 1} />
      </div>

      {phases.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-12 w-12" />}
          title="No Phases Yet"
          description="Get started by adding the first phase of your project."
          actionButton={{
            text: "Add New Phase",
            onClick: () => { 
              // This is a bit of a hack to trigger the dialog from here.
              // A more robust solution might involve global state for dialogs or refs.
              // For now, user can click the main "Add New Phase" button.
              // Or, we can pass a setter to AddPhaseDialog to control its open state.
              // For simplicity, we rely on the existing button.
              const addPhaseButton = document.querySelector('[aria-haspopup="dialog"]');
              if (addPhaseButton instanceof HTMLElement) {
                addPhaseButton.click();
              }
            }
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {phases.map(phase => (
            <PhaseListItem 
              key={phase.id} 
              phase={phase}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editingPhase && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Phase: {editingPhase.name}</DialogTitle>
                    <DialogDescription>
                        Update the details for this phase. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <PhaseForm 
                  onSubmit={handleEditSubmit} 
                  initialData={editingPhase} 
                  isLoading={isSubmittingEdit}
                />
                <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="outline" disabled={isSubmittingEdit}>
                          Cancel
                      </Button>
                  </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
