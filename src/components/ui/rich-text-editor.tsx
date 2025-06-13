"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder"; // Import the Placeholder extension
import Strike from "@tiptap/extension-strike"; // You might want to install this
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline"; // You might want to install this
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Minus } from "lucide-react";
import { Toggle } from "./toggle"; // Your shadcn/ui Toggle
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false, // Don't open link on click in editor
      }),
      Image.configure({
        inline: true, // Allow images to be inline
        allowBase64: true, // For simplicity in example, but consider server upload for production
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline, // Add if you installed it
      Strike, // Add if you installed it
      Placeholder.configure({
        // Configure the Placeholder extension
        placeholder: placeholder || "Enter product description here...", // Use the prop or a default
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[150px] max-h-[300px] overflow-y-auto border border-input rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose max-w-none dark:prose-invert", // Apply shadcn/ui styles and prose for styling
      },
    },
  });

  // Effect to update editor content when 'value' prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false); // `false` prevents moving the cursor to the end
    }
  }, [editor, value]);
  //   const addImage = useCallback(() => {
  //     const url = window.prompt("URL");

  //     if (url) {
  //       editor?.chain().focus().setImage({ src: url }).run();
  //     }
  //   }, [editor]);

  //   const setLink = useCallback(() => {
  //     if (!editor) return;
  //     const previousUrl = editor.getAttributes("link").href;
  //     const url = window.prompt("URL", previousUrl);

  //     // cancelled
  //     if (url === null) {
  //       return;
  //     }

  //     // empty
  //     if (url === "") {
  //       editor.chain().focus().extendMarkRange("link").unsetLink().run();

  //       return;
  //     }

  //     // update link
  //     editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  //   }, [editor]);

  if (!editor) {
    return null; // or a loading spinner
  }

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b">
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          pressed={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          pressed={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          pressed={editor.isActive("strike")}
        >
          <Minus className="h-4 w-4" />
        </Toggle>
        {/* <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          pressed={editor.isActive("code")}
        >
          <Code className="h-4 w-4" />
        </Toggle> */}
        <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          pressed={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          pressed={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        {/* <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          pressed={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          pressed={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          pressed={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
          pressed={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
          pressed={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
          pressed={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("justify").run()
          }
          pressed={editor.isActive({ textAlign: "justify" })}
        >
          <AlignJustify className="h-4 w-4" />
        </Toggle>
        <Button size="sm" variant="ghost" onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button> */}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
