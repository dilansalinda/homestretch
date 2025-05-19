"use client";

import type { Phase } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const phaseFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100, "Name must be 100 characters or less."),
  description: z.string().max(500, "Description must be 500 characters or less.").optional(),
});

export type PhaseFormData = z.infer<typeof phaseFormSchema>;

interface PhaseFormProps {
  onSubmit: (data: PhaseFormData) => void;
  initialData?: Partial<Phase>;
  isLoading?: boolean;
}

export function PhaseForm({ onSubmit, initialData, isLoading }: PhaseFormProps) {
  const form = useForm<PhaseFormData>({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phase Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Foundation Work" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe this phase..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : initialData?.id ? "Save Changes" : "Create Phase"}
        </Button>
      </form>
    </Form>
  );
}
