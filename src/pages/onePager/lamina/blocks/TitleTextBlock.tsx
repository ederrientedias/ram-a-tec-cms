import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { useLaminaStore } from '../store';
import { InlineText } from './InlineText';
import { cn } from '@/lib/utils';
type Props = { blockId: string; title: string; tiptapHtml: string };

const Editor = ({ editor }) => {
  const bubbleMenuItens = [
    {
      label: 'Bold',
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'Italic',
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
  ];

  // const floatingMenuItens = [
  //   {
  //     label: 'H1',
  //     onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  //   },
  //   {
  //     label: 'H2',
  //     onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  //   },
  //   {
  //     label: 'Bullet list',
  //     onClick: () => editor.chain().focus().toggleBulletList().run(),
  //   },
  // ];

  return (
    <>
      {editor && (
        <BubbleMenu
          className="bg-rz-white border border-rz-beige flex items-center gap-2 p-1 shadow-sm rounded"
          editor={editor}
        >
          {bubbleMenuItens.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                'text-rz-black font-normal font-sans text-xs hover:bg-rz-beige hover:text-rz-gold px-2 py-1 rounded',
                editor.isActive(item.label) ? 'bg-rz-dark-beige text-rz-white' : ''
              )}
            >
              {item.label}
            </button>
          ))}
        </BubbleMenu>
      )}

      {/* {editor && (
        <FloatingMenu className="floating-menu" editor={editor}>
          {floatingMenuItens.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                'text-rz-black font-normal font-sans text-xs hover:bg-rz-dark-beige px-2 py-1 rounded',
                editor.isActive(item.label) ? 'bg-rz-dark-beige text-rz-white' : ''
              )}
            >
              {item.label}
            </button>
          ))}
        </FloatingMenu>
      )} */}

      <EditorContent className="outline-none" editor={editor} />
    </>
  );
};

export const TitleTextBlock = React.memo(function TitleTextBlock({
  blockId,
  title,
  tiptapHtml,
}: Props) {
  const setTitle = useLaminaStore((s) => s.updateTitleTextBlockTitle);
  const setHtml = useLaminaStore((s) => s.updateBlockHtml);

  const editor = useEditor({
    extensions: [StarterKit],
    content: tiptapHtml,
    onUpdate: ({ editor }) => {
      // simples: salva HTML. Em produção, use debounce.
      setHtml(blockId, editor.getHTML());
    },
  });

  // se o estado mudar “de fora”, sincroniza o editor
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== tiptapHtml)
      editor.commands.setContent(tiptapHtml, { emitUpdate: false });
  }, [editor, tiptapHtml]);

  return (
    <div className="text-block">
      <InlineText
        className="title"
        value={title}
        onChange={(v) => setTitle(blockId, v)}
        placeholder="Título"
        singleLine
      />
      <Editor editor={editor} />
    </div>
  );
});
