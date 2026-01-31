// components/ui/Skeleton.tsx
'use client';

import { HTMLAttributes } from 'react';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: colors.peach, opacity: 0.3 }}
      {...props}
    />
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border-2 overflow-hidden" style={{ borderColor: colors.peach }}>
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2" style={{ borderColor: colors.peach }}>
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-16 w-full mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}