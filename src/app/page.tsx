"use client";

import { useState, useEffect } from 'react';
import type { Project, Task, Phase, ItemStatus } from '@/types';
import { mockProject } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertTriangle, CheckCircle2, ListChecks, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { format, differenceInDays, parseISO } from 'date-fns';

// Helper function to calculate overall progress
const calculateOverallProgress = (project: Project | null): number => {
  if (!project || project.phases.length === 0) return 0;
  let totalTasks = 0;
  let completedTasks = 0;
  project.phases.forEach(phase => {
    totalTasks += phase.tasks.length;
    phase.tasks.forEach(task => {
      if (task.status === 'completed') {
        completedTasks++;
      }
    });
  });
  return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
};

// Helper to find delayed tasks
const getDelayedItems = (project: Project | null): (Task & { phaseName: string })[] => {
  if (!project) return [];
  const delayed: (Task & { phaseName: string })[] = [];
  project.phases.forEach(phase => {
    phase.tasks.forEach(task => {
      if (task.status === 'delayed') {
        delayed.push({ ...task, phaseName: phase.name });
      } else if (task.status !== 'completed' && task.endDate) {
        try {
          if (differenceInDays(new Date(), parseISO(task.endDate)) > 0) {
             // Implicitly delayed if past due date and not completed
            delayed.push({ ...task, phaseName: phase.name, status: 'delayed' as ItemStatus });
          }
        } catch (e) {
          console.warn("Error parsing task end date:", task.endDate, e);
        }
      }
    });
  });
  return delayed;
};

interface KeyMetric {
  id: string;
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  trend?: string; // e.g. "+5%"
  trendColor?: string;
}

export default function DashboardPage() {
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [delayedItems, setDelayedItems] = useState<(Task & { phaseName: string })[]>([]);
  const [keyMetrics, setKeyMetrics] = useState<KeyMetric[]>([]);

  useEffect(() => {
    // Simulate fetching data
    setProjectData(mockProject);
  }, []);

  useEffect(() => {
    if (projectData) {
      setOverallProgress(calculateOverallProgress(projectData));
      setDelayedItems(getDelayedItems(projectData));
      
      const totalTasks = projectData.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
      const completedTasksCount = projectData.phases.reduce((sum, phase) => sum + phase.tasks.filter(t => t.status === 'completed').length, 0);
      const pendingTasksCount = projectData.phases.reduce((sum, phase) => sum + phase.tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length, 0);
      const daysRemaining = projectData.projectEstimatedEndDate ? differenceInDays(parseISO(projectData.projectEstimatedEndDate), new Date()) : 'N/A';

      setKeyMetrics([
        { id: 'total-tasks', title: "Total Tasks", value: totalTasks, icon: ListChecks, iconColor: "text-blue-500" },
        { id: 'completed-tasks', title: "Completed Tasks", value: completedTasksCount, icon: CheckCircle2, iconColor: "text-green-500", trend: `+${Math.floor(Math.random()*5)}%` , trendColor: "text-green-600"},
        { id: 'pending-tasks', title: "Active/Pending Tasks", value: pendingTasksCount, icon: Clock, iconColor: "text-orange-500" },
        { id: 'days-remaining', title: "Days to Deadline", value: daysRemaining > 0 ? `${daysRemaining}` : 'Overdue', icon: TrendingUp, iconColor: "text-purple-500" },
      ]);
    }
  }, [projectData]);


  if (!projectData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading project data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map(metric => (
          <Card key={metric.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={cn("h-5 w-5 text-muted-foreground", metric.iconColor)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.trend && (
                <p className={cn("text-xs text-muted-foreground", metric.trendColor)}>
                  {metric.trend} from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Project Overview
            </CardTitle>
            <CardDescription>Overall status of {projectData.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground">Overall Progress</span>
                <span className="text-sm font-semibold text-primary">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} aria-label="Overall project progress" className="h-3"/>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Start Date:</strong> {projectData.projectStartDate ? format(parseISO(projectData.projectStartDate), 'MMMM d, yyyy') : 'N/A'}</p>
              <p><strong>Estimated End Date:</strong> {projectData.projectEstimatedEndDate ? format(parseISO(projectData.projectEstimatedEndDate), 'MMMM d, yyyy') : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Delayed Items
            </CardTitle>
            <CardDescription>Tasks that are currently delayed or past their due date.</CardDescription>
          </CardHeader>
          <CardContent>
            {delayedItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delayedItems.slice(0, 5).map((item) => ( // Show top 5
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.phaseName}</TableCell>
                      <TableCell>{item.endDate ? format(parseISO(item.endDate), 'MMM d, yyyy') : 'N/A'}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No delayed items. Great job!</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder for future charts or more detailed sections */}
      {/* 
      <Card>
        <CardHeader><CardTitle>Task Completion Timeline (Placeholder)</CardTitle></CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Chart will be here
        </CardContent>
      </Card>
      */}
    </div>
  );
}
