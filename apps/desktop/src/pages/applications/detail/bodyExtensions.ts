import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { Plugin } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import { isSupportedImage, resolveImageSrc, saveImage } from "../../../features/applications/images";

/**
 * 이미지 노드: 문서에는 `images/…` 상대 경로를 두고, 그릴 때만 asset 주소로 바꾼다.
 * `data-path`에 원래 경로를 남겨 복사·붙여 넣기로 다시 읽을 때도 상대 경로가 유지된다.
 */
const BodyImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-path") ?? el.getAttribute("src"),
        renderHTML: (attrs: { src?: string | null }) =>
          attrs.src ? { src: resolveImageSrc(attrs.src), "data-path": attrs.src } : {},
      },
    };
  },
});

/** Ctrl+V로 이미지 파일이 들어오면 저장한 뒤 그 자리에 이미지 노드를 넣는다. */
const ImagePaste = Extension.create({
  name: "imagePaste",
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const files = Array.from(event.clipboardData?.files ?? []).filter(isSupportedImage);
            if (files.length === 0) return false;
            event.preventDefault();
            void (async () => {
              for (const file of files) {
                try {
                  const src = await saveImage(file);
                  editor.chain().focus().setImage({ src }).run();
                } catch (e) {
                  console.error("이미지를 저장하지 못함", e);
                }
              }
            })();
            return true;
          },
        },
      }),
    ];
  },
});

export const bodyExtensions = [
  StarterKit.configure({
    // 링크를 누르면 앱 창이 그 주소로 넘어가 버리므로 클릭으로 열지 않는다
    link: { openOnClick: false },
  }),
  TaskList,
  TaskItem.configure({ nested: true }),
  BodyImage,
  ImagePaste,
  Placeholder.configure({ placeholder: "여기에 메모를 적어 보세요" }),
  Markdown,
];
