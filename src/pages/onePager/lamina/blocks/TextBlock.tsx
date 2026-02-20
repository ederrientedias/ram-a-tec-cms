import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useLaminaStore } from '../store';
import { InlineText } from './InlineText';

type Props = { blockId: string; title?: string; tiptapHtml: string };

export const TextBlock = React.memo(function TextBlock({ blockId, title, tiptapHtml }: Props) {
  const setHtml = useLaminaStore((s) => s.updateBlockHtml);

  const editor = useEditor({
    extensions: [StarterKit],
    content: tiptapHtml,
    onUpdate: ({ editor }) => setHtml(blockId, editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== tiptapHtml)
      editor.commands.setContent(tiptapHtml, { emitUpdate: false });
  }, [editor, tiptapHtml]);

  return (
    <div className="text-block">
      {typeof title === 'string' && (
        <InlineText
          className="block-title"
          value={title}
          onChange={() => {}}
          placeholder="Título"
          singleLine
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
});
