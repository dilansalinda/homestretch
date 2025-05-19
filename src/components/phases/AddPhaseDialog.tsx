"use client";

import { useState } from "react";
import type { Phase } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { PhaseForm, type PhaseFormData } from "./PhaseForm";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddPhaseDialogProps {
  onPhaseAdded: (newPhase: Omit<Phase, 'id' | 'order' | 'tasks'> & { id: string; order: number; tasks: [] }) => void;
  nextOrder: number;
}

export function AddPhaseDialog({ onPhaseAdded, nextOrder }: AddPhaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: PhaseFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newPhase = {
      ...data,
      id: `phase-${Date.now()}`, // Temporary ID generation
      order: nextOrder,
      tasks: [],
    };
    onPhaseAdded(newPhase);
    setIsLoading(false);
    setOpen(false);
    toast({
      title: "Phase Added",
      description: `"${data.name}" has been successfully added.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Phase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Phase</DialogTitle>
          <DialogDescription>
            Define a new phase for your project. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <PhaseForm onSubmit={handleSubmit} isLoading={isLoading} />
         <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
