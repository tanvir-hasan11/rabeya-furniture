import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-sm border border-border-input bg-bg px-3 text-text placeholder:text-text-muted/70 " +
  "focus:border-accent focus:outline-none focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-muted";

export interface FieldWrapProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldWrapProps) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-text">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
      {describedBy && null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(fieldBase, "h-11", className)} {...rest} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn(fieldBase, "h-11 pr-8", className)} {...rest}>
        {children}
      </select>
    );
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(fieldBase, "py-2", className)} rows={3} {...rest} />;
});
