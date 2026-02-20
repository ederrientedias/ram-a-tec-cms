import React, { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  singleLine?: boolean;
};

export function InlineText({ value, onChange, className, placeholder, singleLine }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerText !== value) ref.current.innerText = value || '';
  }, [value]);

  return (
    <div
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder ?? ''}
      onFocus={() => setIsEditing(true)}
      onBlur={() => {
        setIsEditing(false);
        const text = ref.current?.innerText ?? '';
        onChange(text.trim() ? text : '');
      }}
      onKeyDown={(e) => {
        if (singleLine && e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLDivElement).blur();
        }
      }}
      style={{
        outline: isEditing ? '1px dashed rgba(0,0,0,0.25)' : 'none',
        borderRadius: 6,
        padding: '2px 4px',
        minHeight: 18,
      }}
    />
  );
}
