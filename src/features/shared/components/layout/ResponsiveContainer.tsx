import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  size?: "narrow" | "content" | "wide" | "container" | "fluid";
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function ResponsiveContainer({ 
  children, 
  size = "container", 
  className,
  as: Component = "div"
}: ResponsiveContainerProps) {
  const containerClasses = {
    narrow: "max-w-4xl mx-auto px-4",
    content: "max-w-6xl mx-auto px-4", 
    wide: "max-w-7xl mx-auto px-4",
    container: "container mx-auto px-4",
    fluid: "w-full px-4"
  };

  return (
    <Component className={cn(containerClasses[size], className)}>
      {children}
    </Component>
  );
}