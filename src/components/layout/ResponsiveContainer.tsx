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
    narrow: "container-narrow",
    content: "container-content", 
    wide: "container-wide",
    container: "container-fluid",
    fluid: "w-full px-fluid-lg"
  };

  return (
    <Component className={cn(containerClasses[size], className)}>
      {children}
    </Component>
  );
}