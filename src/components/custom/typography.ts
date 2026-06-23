import { CSSProperties } from 'react';

const FONT_SANS = `'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif`;
const FONT_MONO = `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`;


export const fontSize = {
  xs:   '0.75rem',
  sm:   '0.875rem',
  base: '1rem',
  md:   '1.125rem',
  lg:   '1.25rem',
  xl:   '1.5rem',
  '2xl':'1.875rem',
  '3xl':'2.25rem',
} as const;

export const fontWeight = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
} as const;

export const lineHeight = {
  tight:  1.2,
  snug:   1.35,
  normal: 1.5,
  relaxed:1.65,
} as const;

export const letterSpacing = {
  tight:  '-0.02em',
  normal: '0em',
  wide:   '0.04em',
  wider:  '0.08em',
  widest: '0.12em',
} as const;

export const typography = {

  title: {
    /** 36px — Hero / page-level heading */
    xl: {
      fontFamily: FONT_SANS,
      fontSize: fontSize['3xl'],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
    } satisfies CSSProperties,

    /** 30px — Card or section heading */
    lg: {
      fontFamily: FONT_SANS,
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
    } satisfies CSSProperties,

    /** 24px — Panel / widget heading */
    md: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.tight,
    } satisfies CSSProperties,
  },

 
  subtitle: {
    /** 20px — Below a hero title */
    lg: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.normal,
    } satisfies CSSProperties,

    /** 18px — Below a section heading */
    md: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    } satisfies CSSProperties,

    /** 16px — Below a card heading */
    sm: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    } satisfies CSSProperties,
  },

 
  label: {
    /** 12px — Table column headers, section eyebrows */
    xs: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.widest,
      textTransform: 'uppercase' as const,
    } satisfies CSSProperties,

    /** 14px — Form field labels, sidebar nav */
    sm: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.wide,
      textTransform: 'uppercase' as const,
    } satisfies CSSProperties,

    /** 16px — Prominent labels, active nav items */
    md: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.wide,
    } satisfies CSSProperties,
  },


  body: {
    /** 14px — Secondary content, helper text, timestamps */
    sm: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.relaxed,
      letterSpacing: letterSpacing.normal,
    } satisfies CSSProperties,

    /** 16px — Primary body copy */
    md: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.base,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    } satisfies CSSProperties,

    /** 18px — Comfortable reading, detail pages */
    lg: {
      fontFamily: FONT_SANS,
      fontSize: fontSize.md,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.relaxed,
      letterSpacing: letterSpacing.normal,
    } satisfies CSSProperties,
  },

  
  mono: {
    sm: {
      fontFamily: FONT_MONO,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    } satisfies CSSProperties,

    md: {
      fontFamily: FONT_MONO,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    } satisfies CSSProperties,
  },

} as const;

export function injectTypographyCSSVars(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Font sizes
  Object.entries(fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--gv-font-size-${key}`, value);
  });

  // Font weights
  Object.entries(fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--gv-font-weight-${key}`, String(value));
  });

  // Line heights
  Object.entries(lineHeight).forEach(([key, value]) => {
    root.style.setProperty(`--gv-line-height-${key}`, String(value));
  });

  // Letter spacing
  Object.entries(letterSpacing).forEach(([key, value]) => {
    root.style.setProperty(`--gv-letter-spacing-${key}`, value);
  });
}


export type TypographyRole = keyof typeof typography;
export type TitleVariant    = keyof typeof typography.title;
export type SubtitleVariant = keyof typeof typography.subtitle;
export type LabelVariant    = keyof typeof typography.label;
export type BodyVariant     = keyof typeof typography.body;
export type MonoVariant     = keyof typeof typography.mono;