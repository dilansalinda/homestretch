"use client";

import type { Phase } from "@/types";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Edit3, Trash2, Eye, ListChecks, CheckCircle2, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface PhaseListItemProps {
  phase: Phase;
  onEdit: (phase: Phase) => void;
  onDelete: (phaseId: string) => void;
}

export function PhaseListItem({ phase, onEdit, onDelete }: PhaseListItemProps) {
  const completedTasks = phase.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = phase.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overallStatus = () => {
    if (totalTasks === 0) return "pending";
    if (completedTasks === totalTasks) return "completed";
    if (phase.tasks.some(task => task.status === 'delayed')) return "delayed";
    if (phase.tasks.some(task => task.status === 'in-progress')) return "in-progress";
    return "pending";
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{phase.name}</CardTitle>
            <CardDescription className="line-clamp-2">{phase.description || "No description available."}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/phases/${phase.id}`} className="flex items-center w-full">
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(phase)} className="cursor-pointer">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Phase
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ConfirmDeleteDialog
                triggerButton={
                  <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm text-destructive hover:text-destructive focus-visible:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Phase
                  </Button>
                }
                itemName={phase.name}
                onConfirm={() => onDelete(phase.id)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">Overall Status</span>
            <StatusBadge status={overallStatus()} />
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-semibold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} aria-label={`${phase.name} progress`} className="h-2" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
                <ListChecks className="h-3.5 w-3.5 mr-1 text-blue-500"/> Tasks: {totalTasks}
            </div>
            <div className="flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500"/> Completed: {completedTasks}
            </div>
            <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-orange-500"/> Pending: {totalTasks - completedTasks}
            </div>
        </div>
      </CardContent>
       <CardFooter>
         <Link href={`/phases/${phase.id}`} className="w-full" legacyBehavior>
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" /> View Details
            </Button>
         </Link>
      </CardFooter>
    </Card>
  );
}
