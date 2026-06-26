import React from "react";
import { cn } from "@/lib/utils";
type TitleSize = "xl" | "lg" | "md" | "sm";

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: TitleSize;
  as?: "h1" | "h2" | "h3" | "h4";
  accent?: boolean;       
  muted?: boolean;      
}

const titleSize: Record<TitleSize, string> = {
  xl: "text-[2.75rem] leading-[1.1] tracking-[-0.03em]",  
  lg: "text-[2rem]   leading-[1.15] tracking-[-0.025em]",  
  md: "text-[1.5rem] leading-[1.2]  tracking-[-0.02em]",   
  sm: "text-[1.2rem] leading-[1.25] tracking-[-0.015em]",  
};

export function Title({
  size = "lg",
  as: Tag = "h2",
  accent = false,
  muted = false,
  className,
  children,
  ...props
}: TitleProps) {
  return (
    <Tag
      className={cn(
        "font-title font-semibold text-gv-text-primary",
        titleSize[size],
        muted && "opacity-60",
        accent &&
          "bg-gradient-to-r from-[var(--gv-brand)] to-[#6dd5c2] bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
type SubtitleSize = "lg" | "md" | "sm";

interface SubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: SubtitleSize;
  as?: "p" | "span" | "div" | "h3" | "h4" | "h5" | "h6";
  muted?: boolean;
  brand?: boolean;  
}

const subtitleSize: Record<SubtitleSize, string> = {
  lg: "text-[1.375rem] leading-[1.45] tracking-[-0.015em]",
  md: "text-[1.25rem]  leading-[1.5]  tracking-[-0.01em]",
  sm: "text-[1.125rem] leading-[1.5]  tracking-[0]",
};

export function Subtitle({
  size = "md",
  as: Tag = "p",
  muted = false,
  brand = false,
  className,
  children,
  ...props
}: SubtitleProps) {
  return (
    <Tag
      className={cn(
        "font-sans font-medium",
        subtitleSize[size],
        muted  ? "text-[var(--gv-text-muted)]"  : "text-[var(--gv-text-primary)]",
        brand  && "text-[var(--gv-brand)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
type LabelSize = "lg" | "md" | "sm";

interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: LabelSize;
  as?: "span" | "label" | "p" | "div" | "dt";
  brand?: boolean;
  subtle?: boolean;
}

const labelSize: Record<LabelSize, string> = {
  lg: "text-[0.8rem]   tracking-[0.1em]",
  md: "text-[0.7rem]   tracking-[0.12em]",
  sm: "text-[0.625rem] tracking-[0.15em]",
};

export function Label({
  size = "md",
  as: Tag = "span",
  brand = false,
  subtle = false,
  className,
  children,
  ...props
}: LabelProps) {
  return (
    <Tag
      className={cn(
        "font-mono font-medium uppercase",
        labelSize[size],
        subtle  ? "text-[var(--gv-text-subtle)]"  : "text-[var(--gv-text-muted)]",
        brand   && "text-[var(--gv-brand)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

type BodySize = "lg" | "md" | "sm" | "xs";

interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: BodySize;
  as?: "p" | "span" | "div" | "li" | "td" | "dd";
  muted?: boolean;
  subtle?: boolean;
  mono?: boolean;   // switches to Space Mono (good for data/values)
}

const bodySize: Record<BodySize, string> = {
  lg: "text-[1rem]     leading-[1.65]",
  md: "text-[0.9rem]   leading-[1.65]",
  sm: "text-[0.8125rem] leading-[1.6]",
  xs: "text-[0.75rem]  leading-[1.55]",
};

export function Body({
  size = "md",
  as: Tag = "p",
  muted = false,
  subtle = false,
  mono = false,
  className,
  children,
  ...props
}: BodyProps) {
  return (
    <Tag
      className={cn(
        mono ? "font-mono" : "font-sans",
        "font-normal",
        bodySize[size],
        subtle ? "text-[var(--gv-text-subtle)]"
               : muted ? "text-[var(--gv-text-muted)]"
                       : "text-[var(--gv-text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
export const Typography = { Title, Subtitle, Label, Body };