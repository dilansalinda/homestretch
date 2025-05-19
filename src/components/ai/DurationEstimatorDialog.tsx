"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2 } from "lucide-react";
import { estimateDuration, type EstimateDurationOutput } from "@/ai/flows/estimate-duration";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DurationEstimatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEstimateGenerated: (estimate: EstimateDurationOutput) => void;
  itemName: string; // e.g., "Task Name" or "Step Name"
  initialDescription?: string;
}

export function DurationEstimatorDialog({
  open,
  onOpenChange,
  onEstimateGenerated,
  itemName,
  initialDescription = "",
}: DurationEstimatorDialogProps) {
  const [description, setDescription] = useState(initialDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<EstimateDurationOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please provide a description for the item.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const result = await estimateDuration({ taskDescription: description });
      setSuggestion(result);
    } catch (err) {
      console.error("Error estimating duration:", err);
      setError("Failed to get an estimate. Please try again.");
      toast({
        title: "Error",
        description: "Could not fetch duration estimate from AI.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      onEstimateGenerated(suggestion);
      onOpenChange(false); // Close dialog on accept
      toast({
        title: "Suggestion Applied",
        description: `AI's duration estimate for "${itemName}" has been applied.`,
      });
    }
  };
  
  // Reset state when dialog is closed/opened
  useState(() => {
    if (open) {
      setDescription(initialDescription);
      setIsLoading(false);
      setError(null);
      setSuggestion(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  });


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-accent" />
            AI Duration Estimator
          </DialogTitle>
          <DialogDescription>
            Get an AI-powered duration estimate for "{itemName}". Describe the item below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item-description">Item Description</Label>
            <Textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`e.g., "Install kitchen cabinets and countertops"`}
              rows={4}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Get Estimate
          </Button>
        </form>
        {suggestion && (
          <div className="mt-4 space-y-3">
            <Alert>
              <AlertTitle className="font-semibold">AI Suggestion:</AlertTitle>
              <AlertDescription className="space-y-1">
                <p><strong>Estimated Duration:</strong> {suggestion.durationEstimate}</p>
                <p><strong>Reasoning:</strong> {suggestion.reasoning}</p>
              </AlertDescription>
            </Alert>
            <Button onClick={handleAcceptSuggestion} className="w-full" variant="outline">
              Accept Suggestion
            </Button>
          </div>
        )}
        <DialogFooter className="sm:justify-start mt-4">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
