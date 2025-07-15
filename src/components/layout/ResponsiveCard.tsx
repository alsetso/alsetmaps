import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "xl";
  shadow?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export const ResponsiveCard = forwardRef<HTMLDivElement, ResponsiveCardProps>(
  ({ children, className, hover = true, padding = "lg", shadow = "sm" }, ref) => {
    const paddingClasses = {
      sm: "p-fluid-sm",
      md: "p-fluid-md", 
      lg: "p-fluid-lg",
      xl: "p-fluid-xl"
    };

    const shadowClasses = {
      xs: "shadow-xs",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg", 
      xl: "shadow-xl",
      "2xl": "shadow-2xl"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "card-responsive",
          paddingClasses[padding],
          shadowClasses[shadow],
          hover && "hover:shadow-md hover:-translate-y-0.5 transition-all duration-base",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ResponsiveCard.displayName = "ResponsiveCard";