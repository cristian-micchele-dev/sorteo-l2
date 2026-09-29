import type { ButtonHTMLAttributes, Ref } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: Variant
  /** En React 19 `ref` es un prop más: no hace falta forwardRef. */
  readonly ref?: Ref<HTMLButtonElement>
}

const variants: Record<Variant, string> = {
  primary:
    'border-adena/60 bg-linear-to-b from-adena/25 to-forge text-adena-bright hover:from-adena/40 hover:text-parchment',
  ghost: 'border-steel bg-forge/60 text-ash hover:border-iron hover:text-parchment',
  danger: 'border-blood/60 bg-blood/15 text-ember hover:bg-blood/30 hover:text-parchment',
}

export const Button = ({ variant = 'ghost', className = '', ...props }: ButtonProps) => (
  <button
    {...props}
    className={`rounded-sm border px-3 py-1.5 font-display text-xs font-bold tracking-[0.14em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-current ${variants[variant]} ${className}`}
  />
)
