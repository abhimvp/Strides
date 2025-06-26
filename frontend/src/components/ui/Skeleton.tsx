import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 transition-colors ${className}`}
      {...props}
    />
  );
};

// Predefined skeleton components for common use cases
export const TaskSkeleton = () => (
  <div className="flex justify-between items-center py-3 bg-white rounded-lg px-2 mb-2 shadow-sm">
    <div className="flex items-center gap-3 flex-grow">
      <Skeleton className="h-5 w-5 rounded-full" />
      <div className="space-y-2 flex-grow">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="flex gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-8 rounded-lg" />
      ))}
    </div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-4 border dark:border-slate-700 transition-colors">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <TaskSkeleton />
      <TaskSkeleton />
      <TaskSkeleton />
    </div>
  </div>
);
