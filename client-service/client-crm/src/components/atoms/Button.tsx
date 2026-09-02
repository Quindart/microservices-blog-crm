import type { ButtonHTMLAttributes, ReactNode } from 'react';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
};
export function Button({
  children,
  variant = 'ghost',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variant === 'primary' ? 'primary' : 'social-button'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
