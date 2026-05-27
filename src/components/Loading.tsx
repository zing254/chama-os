import { cn } from '../utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  text?: string;
  centered?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};

export default function Loading({ size = 'md', fullScreen = false, text, centered = true }: LoadingProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', centered && 'justify-center')}>
      <div
        className={cn(
          'border-green-200 border-t-green-600 rounded-full animate-spin',
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-gray-500 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text={text} />
    </div>
  );
}

export function ButtonLoading({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
      {children}
    </span>
  );
}

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gray-200 animate-pulse rounded', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonLoader className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader className="h-4 w-3/4 rounded" />
          <SkeletonLoader className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SkeletonLoader className="h-16 rounded-xl" />
        <SkeletonLoader className="h-16 rounded-xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 p-4 bg-gray-50 rounded-t-xl">
        {[1, 2, 3, 4].map(i => (
          <SkeletonLoader key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b">
          {[1, 2, 3, 4].map(j => (
            <SkeletonLoader key={j} className="h-4 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i}>
          <SkeletonLoader className="h-4 w-24 mb-2 rounded" />
          <SkeletonLoader className="h-10 w-full rounded-xl" />
        </div>
      ))}
      <SkeletonLoader className="h-12 w-full rounded-xl mt-6" />
    </div>
  );
}