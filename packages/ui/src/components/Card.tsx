import type { ReactNode } from "react";

import { cn } from "./cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className, elevated = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded bg-surface-0 p-6",
        elevated ? "shadow-elevated" : "shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="text-lg font-medium text-brand-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-brand-500">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
