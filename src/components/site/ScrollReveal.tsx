import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { type ReactNode } from "react";

type AnimationType =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-in"
  | "scale-in"
  | "zoom-in"
  | "flip-up";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "article" | "span";
  threshold?: number;
}

const animationClass: Record<AnimationType, string> = {
  "fade-up": "opacity-0 translate-y-8",
  "fade-down": "opacity-0 -translate-y-8",
  "fade-left": "opacity-0 -translate-x-8",
  "fade-right": "opacity-0 translate-x-8",
  "fade-in": "opacity-0",
  "scale-in": "opacity-0 scale-95",
  "zoom-in": "opacity-0 scale-90",
  "flip-up": "opacity-0 rotate-x-12 translate-y-6",
};

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  className,
  as: Tag = "div",
  threshold,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold });

  const hidden = animationClass[animation];
  const visible = "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-x-0";

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "transition-[opacity,transform] ease-out will-change-transform",
        isVisible ? visible : hidden,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
  animation?: AnimationType;
  as?: "div" | "section" | "ul";
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 100,
  baseDelay = 0,
  animation = "fade-up",
  as: Tag = "div",
}: StaggerContainerProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <ScrollReveal
              key={i}
              animation={animation}
              delay={baseDelay + i * staggerDelay}
              className={className ? undefined : undefined}
            >
              {child}
            </ScrollReveal>
          ))
        : children}
    </Tag>
  );
}
