import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  minWidth?: string;
}

export function ResponsiveGrid({ 
  children, 
  size = "md", 
  className, 
  minWidth 
}: ResponsiveGridProps) {
  const gridClasses = {
    sm: "grid-responsive-sm",
    md: "grid-responsive", 
    lg: "grid-responsive-lg"
  };

  const style = minWidth ? {
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`
  } : undefined;

  return (
    <div 
      className={cn(gridClasses[size], className)} 
      style={style}
    >
      {children}
    </div>
  );
}