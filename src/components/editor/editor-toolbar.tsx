import {
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  UnderlineIcon,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorToolbarProps = {
  editor: Editor | null;
  className?: string;
};

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className={cn(
        "size-9 rounded-lg text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white",
        active &&
          "bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/20 hover:text-cyan-100",
      )}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  // Always reserve the rail width so TipTap hydration doesn’t shift the column.
  return (
    <aside
      className={cn(
        "sticky top-6 z-20 hidden w-[3.25rem] shrink-0 sm:block",
        className,
      )}
      aria-label={editor ? "Formatting tools" : undefined}
      aria-hidden={editor ? undefined : true}
    >
      {editor ? (
        <div className="flex w-full flex-col items-center gap-0.5 rounded-2xl border border-white/10 bg-[#0d1220]/90 p-1.5 ring-1 ring-white/[0.06] backdrop-blur-xl">
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-3.5" />
          </ToolbarButton>

          <span className="my-1 h-px w-5 bg-white/10" aria-hidden="true" />

          <ToolbarButton
            label="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1Icon className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2Icon className="size-3.5" />
          </ToolbarButton>

          <span className="my-1 h-px w-5 bg-white/10" aria-hidden="true" />

          <ToolbarButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListIcon className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Ordered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon className="size-3.5" />
          </ToolbarButton>
        </div>
      ) : null}
    </aside>
  );
}
