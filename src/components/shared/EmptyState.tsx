import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function EmptyState({ icon, title, description, actionButton }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center shadow-sm h-full">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionButton && (
        <Button onClick={actionButton.onClick}>
          {actionButton.icon || <PlusCircle className="mr-2 h-4 w-4" />}
          {actionButton.text}
        </Button>
      )}
    </div>
  );
}
