import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { isImageBaseReady, loadImageBaseDir } from "../../../features/applications/images";
import { bodyExtensions } from "./bodyExtensions";
import "./MarkdownBody.css";

interface MarkdownBodyProps {
  /** 처음 열 때의 본문. 이후 바뀌어도 편집기 내용을 다시 덮어쓰지 않는다 (카드를 바꾸려면 key를 바꾼다). */
  initialValue: string;
  onChange: (markdown: string) => void;
}

/**
 * 본문 편집기 (R34~R35). 쓰는 즉시 서식이 바뀌는 Tiptap 편집기이고, 저장은 마크다운 문자열로 한다.
 * 이미지 경로를 풀려면 앱 데이터 폴더를 알아야 해서, 그걸 읽은 뒤에 편집기를 만든다.
 */
function MarkdownBody(props: MarkdownBodyProps) {
  const [ready, setReady] = useState(isImageBaseReady);

  useEffect(() => {
    if (ready) return;
    loadImageBaseDir()
      .catch((e: unknown) => console.error("앱 데이터 폴더를 읽지 못함", e))
      .finally(() => setReady(true));
  }, [ready]);

  return ready ? <BodyEditor {...props} /> : null;
}

function BodyEditor({ initialValue, onChange }: MarkdownBodyProps) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: bodyExtensions,
    content: initialValue,
    contentType: "markdown",
    onUpdate: ({ editor: e }) => onChangeRef.current(e.getMarkdown()),
  });

  return <EditorContent editor={editor} className="markdown-body" />;
}

export default MarkdownBody;
