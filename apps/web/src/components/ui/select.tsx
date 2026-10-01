'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextValue {
  value: string;
  onValueChange: (val: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  items: Map<string, string>;
  registerItem: (value: string, label: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export function Select({
  value = '',
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [items] = React.useState(() => new Map<string, string>());

  const registerItem = React.useCallback((val: string, label: string) => {
    items.set(val, label);
  }, [items]);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: onValueChange || (() => {}),
        open,
        setOpen,
        items,
        registerItem,
      }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);

  return (
    <button
      type="button"
      id={id}
      aria-haspopup="listbox"
      aria-expanded={Boolean(ctx?.open)}
      onClick={(e) => {
        e.stopPropagation();
        ctx?.setOpen(!ctx.open);
      }}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {children}
      <ChevronDown className="size-4 opacity-50 shrink-0 ml-1" />
    </button>
  );
}

export function SelectValue({
  placeholder,
}: {
  placeholder?: string;
}) {
  const ctx = React.useContext(SelectContext);
  const label = ctx?.value ? ctx.items.get(ctx.value) || ctx.value : placeholder;

  return <span className="truncate">{label || placeholder || ''}</span>;
}

export function SelectContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);

  React.useEffect(() => {
    if (!ctx?.open) return;
    const handleOutsideClick = () => {
      ctx.setOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [ctx]);

  if (!ctx?.open) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'absolute left-0 top-[calc(100%+4px)] z-50 max-h-60 w-full min-w-[8rem] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);

  React.useEffect(() => {
    if (typeof children === 'string') {
      ctx?.registerItem(value, children);
    }
  }, [ctx, value, children]);

  const isSelected = ctx?.value === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        ctx?.onValueChange(value);
        ctx?.setOpen(false);
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent/80 font-semibold',
        className,
      )}
    >
      {children}
    </div>
  );
}
