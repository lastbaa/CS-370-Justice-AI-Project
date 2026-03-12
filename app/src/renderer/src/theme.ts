/**
 * Theme utilities.
 *
 * Colors are driven entirely by CSS custom properties defined in globals.css.
 * Components use `var(--bg)`, `rgb(var(--ov) / 0.35)`, etc. in inline styles.
 * Switching themes only requires setting `data-theme` on the root element.
 */

export type Theme = 'dark' | 'light'

/** Convenience: overlay color at a given alpha using the current theme. */
export function ov(alpha: number): string {
  return `rgb(var(--ov) / ${alpha})`
}
