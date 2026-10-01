'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';

export interface InlineEditContextValue {
  isEditable: boolean;
  isUz: boolean;
  effectiveViewport?: 'desktop' | 'tablet' | 'mobile';
  onUpdateBlockConfig?: (blockId: string, updatedConfig: Record<string, unknown>) => void;
}

const InlineEditContext = createContext<InlineEditContextValue>({
  isEditable: false,
  isUz: true,
  effectiveViewport: undefined,
});

export function InlineEditProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: InlineEditContextValue;
}): JSX.Element {
  return (
    <InlineEditContext.Provider value={value}>
      {children}
    </InlineEditContext.Provider>
  );
}

export function useInlineEdit(): InlineEditContextValue {
  return useContext(InlineEditContext);
}

/**
 * Инлайн-редактируемый текстовый элемент (заголовки, подзаголовки, бейджи, кнопки, карточки)
 */
export function EditableText({
  value,
  onChange,
  as: Tag = 'span',
  className = '',
  placeholder = 'Matn kiriting...',
  multiline = false,
}: {
  value?: string;
  onChange?: (val: string) => void;
  as?: React.ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}): JSX.Element {
  const { isEditable, isUz } = useInlineEdit();
  const elRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const safePlaceholder = placeholder || (isUz ? 'Matn kiriting...' : 'Введите текст...');
  const textContent = value ?? '';

  // Синхронизация содержимого снаружи только если элемент не в фокусе
  useEffect(() => {
    if (!elRef.current) return;
    if (document.activeElement === elRef.current) return;
    if (elRef.current.innerText !== textContent) {
      elRef.current.innerText = textContent;
    }
  }, [textContent]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!elRef.current || !onChange) return;
    const newText = (elRef.current.innerText || '').trim();
    if (newText !== textContent) {
      onChange(newText);
    }
  }, [onChange, textContent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      e.stopPropagation();
      if (!multiline && e.key === 'Enter') {
        e.preventDefault();
        elRef.current?.blur();
      }
    },
    [multiline],
  );

  if (!isEditable || !onChange) {
    return (
      <Tag className={className}>
        {textContent || ''}
      </Tag>
    );
  }

  const isEmpty = !textContent && !isFocused;

  return (
    <Tag
      ref={elRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      aria-label={safePlaceholder}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      onPointerDown={(e: React.PointerEvent) => {
        e.stopPropagation();
      }}
      onMouseDown={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      onKeyDown={handleKeyDown}
      className={`${className} cursor-text transition-all outline-none rounded px-1 -mx-1 pointer-events-auto ${
        isFocused
          ? 'ring-2 ring-primary bg-primary/5 shadow-xs'
          : 'hover:ring-1 hover:ring-primary/50 hover:bg-primary/5'
      } ${isEmpty ? 'text-muted-foreground/60 italic' : ''}`}
      data-inline-editable="true"
    >
      {isEmpty ? safePlaceholder : textContent}
    </Tag>
  );
}

/**
 * Инлайн-редактируемый блок для HTML / Rich Text
 */
export function EditableHtml({
  html,
  onChange,
  className = '',
  placeholder = 'Matn mazmuni...',
}: {
  html?: string;
  onChange?: (val: string) => void;
  className?: string;
  placeholder?: string;
}): JSX.Element {
  const { isEditable, isUz } = useInlineEdit();
  const elRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const safePlaceholder = placeholder || (isUz ? 'Matn mazmuni kiriting...' : 'Введите текст...');
  const content = html ?? '';

  useEffect(() => {
    if (!elRef.current) return;
    if (document.activeElement === elRef.current) return;
    if (elRef.current.innerHTML !== content) {
      elRef.current.innerHTML = content || (isEditable ? `<p class="text-muted-foreground/60 italic">${safePlaceholder}</p>` : '');
    }
  }, [content, isEditable, safePlaceholder]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!elRef.current || !onChange) return;
    const newHtml = elRef.current.innerHTML.trim();
    if (newHtml !== content) {
      onChange(newHtml);
    }
  }, [onChange, content]);

  if (!isEditable || !onChange) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div
      ref={elRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      aria-label={safePlaceholder}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      onPointerDown={(e: React.PointerEvent) => {
        e.stopPropagation();
      }}
      onMouseDown={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        e.stopPropagation();
      }}
      className={`${className} cursor-text transition-all outline-none rounded-lg p-1.5 -m-1.5 pointer-events-auto ${
        isFocused
          ? 'ring-2 ring-primary bg-primary/5 shadow-xs'
          : 'hover:ring-1 hover:ring-primary/50 hover:bg-primary/5'
      }`}
      data-inline-editable="true"
      dangerouslySetInnerHTML={{
        __html: content || `<p class="text-muted-foreground/60 italic">${safePlaceholder}</p>`,
      }}
    />
  );
}
