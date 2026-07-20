import type { Editor } from "@tiptap/react";
import { Extension } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type RemoteCursor = {
  userId: string;
  name: string;
  color: string;
  from: number;
  to: number;
};

const remoteCursorsKey = new PluginKey<RemoteCursor[]>("remoteCursors");

function clampPos(docSize: number, pos: number) {
  return Math.max(1, Math.min(pos, docSize - 1));
}

function buildDecorations(doc: ProseMirrorNode, cursors: RemoteCursor[]) {
  const decorations: Decoration[] = [];
  const docSize = doc.nodeSize;

  for (const cursor of cursors) {
    const from = clampPos(docSize, cursor.from);
    const to = clampPos(docSize, cursor.to);
    const color = cursor.color;

    if (from !== to) {
      decorations.push(
        Decoration.inline(Math.min(from, to), Math.max(from, to), {
          style: `background-color: ${color}33`,
          class: "remote-selection",
        }),
      );
    }

    decorations.push(
      Decoration.widget(
        to,
        () => {
          const wrap = document.createElement("span");
          wrap.className = "remote-caret";
          wrap.contentEditable = "false";
          wrap.style.cssText = [
            "position:relative",
            "display:inline-block",
            "width:0",
            "height:1.15em",
            "vertical-align:text-bottom",
            "pointer-events:none",
            "z-index:20",
          ].join(";");

          const bar = document.createElement("span");
          bar.style.cssText = [
            "position:absolute",
            "top:0",
            "left:0",
            "width:2px",
            "height:100%",
            `background:${color}`,
            "border-radius:1px",
          ].join(";");

          const label = document.createElement("span");
          label.textContent = cursor.name;
          label.style.cssText = [
            "position:absolute",
            "top:-1.35rem",
            "left:0",
            "transform:translateX(-20%)",
            "white-space:nowrap",
            "border-radius:4px",
            "padding:1px 6px",
            "font-size:10px",
            "font-weight:600",
            "line-height:1.4",
            "letter-spacing:-0.01em",
            "color:#0a0e1a",
            `background:${color}`,
            "box-shadow:0 4px 12px rgba(0,0,0,0.35)",
            "max-width:10rem",
            "overflow:hidden",
            "text-overflow:ellipsis",
          ].join(";");

          wrap.appendChild(bar);
          wrap.appendChild(label);
          return wrap;
        },
        { side: 1, key: `remote-caret-${cursor.userId}` },
      ),
    );
  }

  return DecorationSet.create(doc, decorations);
}

export function setRemoteCursors(editor: Editor, cursors: RemoteCursor[]) {
  editor.view.dispatch(editor.state.tr.setMeta(remoteCursorsKey, cursors));
}

export const RemoteCursors = Extension.create({
  name: "remoteCursors",

  addProseMirrorPlugins() {
    return [
      new Plugin<RemoteCursor[]>({
        key: remoteCursorsKey,
        state: {
          init: () => [],
          apply(tr, value) {
            const meta = tr.getMeta(remoteCursorsKey) as
              | RemoteCursor[]
              | undefined;
            if (meta) return meta;
            return value;
          },
        },
        props: {
          decorations(state) {
            const cursors = remoteCursorsKey.getState(state) ?? [];
            if (cursors.length === 0) return null;
            return buildDecorations(state.doc, cursors);
          },
        },
      }),
    ];
  },
});
