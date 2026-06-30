"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import { Plugin } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toEnglishDigits, toPersianDigits } from "@/lib/persian-numbers";
import { persianizeHtmlText } from "@/lib/html-persian-digits";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Quote,
  List,
  ListOrdered,
  Heading2,
  Undo2,
  Redo2,
  Eraser,
  Minus,
} from "lucide-react";

export type RichTextEditorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  minHeight?: number;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  stickyToolbar?: boolean;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150",
        active
          ? "bg-primary text-white shadow-sm"
          : "bg-background/70 text-muted hover:bg-primary-soft/40 hover:text-primary",
        disabled && "cursor-not-allowed opacity-35",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}

/** Converts digits typed or pasted as plain text into Persian digits in place. */
const PersianDigitsInputExtension = Extension.create({
  name: "persianDigitsInput",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleTextInput(view, from, to, text) {
            const converted = toPersianDigits(toEnglishDigits(text));
            if (converted === text) return false;
            view.dispatch(view.state.tr.insertText(converted, from, to));
            return true;
          },
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain");
            if (!text) return false;
            const converted = toPersianDigits(toEnglishDigits(text));
            if (converted === text) return false;
            view.dispatch(view.state.tr.insertText(converted));
            return true;
          },
        },
      }),
    ];
  },
});

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "بنویس...",
  error,
  minHeight = 280,
  disabled = false,
  helperText,
  className,
  stickyToolbar = true,
}: RichTextEditorProps) {
  const handleUpdate = useCallback(
    ({ editor }: Parameters<NonNullable<Parameters<typeof useEditor>[0]["onUpdate"]>>[0]) => {
      if (!editor) return;
      const html: string = editor.isEmpty ? "" : editor.getHTML();
      onChange(persianizeHtmlText(html));
    },
    [onChange],
  );

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyNodeClass: "rte-placeholder",
      }),
      PersianDigitsInputExtension,
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: "rte-content outline-none",
        dir: "rtl",
        spellcheck: "false",
      },
    },
  });

  // Sync external value changes (e.g. edit page initial load)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.isEmpty ? "" : editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  // Update placeholder when prop changes
  useEffect(() => {
    if (!editor) return;
    editor.extensionManager.extensions
      .find((e) => e.name === "placeholder")
      // @ts-expect-error tiptap storage
      ?.options && (editor.extensionStorage["placeholder"].placeholder = placeholder);
  }, [editor, placeholder]);

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-black text-foreground">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative overflow-visible rounded-[1.5rem] border bg-card transition-all duration-200",
          "shadow-[inset_0_2px_8px_rgba(94,58,47,0.04)]",
          error
            ? "border-danger focus-within:ring-4 focus-within:ring-danger/20"
            : "border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-soft/35",
          disabled && "opacity-60",
        )}
      >
        {/* ── Toolbar ── */}
        <div
          className={cn(
            "flex flex-nowrap items-center gap-1.5 overflow-x-auto rounded-t-[1.5rem] border-b border-border bg-card/92 px-2 py-2 backdrop-blur-xl sm:flex-wrap",
            stickyToolbar && "sticky top-20 z-20 shadow-[0_12px_40px_rgba(94,58,47,0.08)] sm:top-24",
          )}
        >
          {/* History */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!canUndo || disabled}
            title="بازگشت (Ctrl+Z)"
          >
            <Undo2 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!canRedo || disabled}
            title="تکرار (Ctrl+Y)"
          >
            <Redo2 className="size-3.5" />
          </ToolbarButton>

          <Divider />

          {/* Inline marks */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            disabled={disabled}
            title="ضخیم (Ctrl+B)"
          >
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
            disabled={disabled}
            title="کج (Ctrl+I)"
          >
            <Italic className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline")}
            disabled={disabled}
            title="زیرخط (Ctrl+U)"
          >
            <UnderlineIcon className="size-3.5" />
          </ToolbarButton>

          <Divider />

          {/* Headings */}
          <ToolbarButton
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor?.isActive("heading", { level: 2 })}
            disabled={disabled}
            title="عنوان"
          >
            <Heading2 className="size-3.5" />
          </ToolbarButton>

          <Divider />

          {/* Block elements */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive("blockquote")}
            disabled={disabled}
            title="نقل‌قول"
          >
            <Quote className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            disabled={disabled}
            title="لیست نقطه‌ای"
          >
            <List className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            disabled={disabled}
            title="لیست شماره‌ای"
          >
            <ListOrdered className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor?.chain().focus().setHorizontalRule().run()
            }
            disabled={disabled}
            title="خط افقی"
          >
            <Minus className="size-3.5" />
          </ToolbarButton>

          <Divider />

          {/* Utilities */}
          <ToolbarButton
            onClick={() =>
              editor?.chain().focus().clearNodes().unsetAllMarks().run()
            }
            disabled={disabled}
            title="پاک کردن قالب‌بندی"
          >
            <Eraser className="size-3.5" />
          </ToolbarButton>
        </div>

        {/* ── Editor area ── */}
        <div
          className="rte-wrapper px-5 py-4"
          style={{ minHeight }}
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {helperText && !error && (
        <p className="text-xs leading-5 text-muted">{helperText}</p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
