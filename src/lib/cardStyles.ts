/**
 * Shared style objects, ported from the original MUI `cardStyles.ts`.
 *
 * Returned objects can be applied via :style / v-bind on Vue templates.
 */
export interface CardStyleOptions {
  dark?: boolean
}

export const outerCardStyles = ({ dark = false }: CardStyleOptions = {}) => ({
  borderRadius: '8px',
  boxShadow: dark
    ? '0 0 12px -2px rgba(0,0,0,0.8)'
    : '0 0 12px -2px rgba(0,0,0,0.4)',
  border: dark
    ? '1px solid rgba(255,255,255,0.08)'
    : '1px solid rgba(255,255,255,0.1)',
  background: dark ? '#1E1E1E' : 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(10px)',
})

export const innerCardStyles = {
  borderRadius: '4px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  boxShadow: '0 4px 16px -2px rgba(0,0,0,0.3)',
}
