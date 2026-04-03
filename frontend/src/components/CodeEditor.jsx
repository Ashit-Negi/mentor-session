import Editor from "@monaco-editor/react";
import { useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

function CodeEditor({ sessionId }) {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // 🧠 Yjs document
    const ydoc = new Y.Doc();

    // 🌐 WebSocket connection
    const provider = new WebsocketProvider(
      import.meta.env.VITE_YJS_URL,
      sessionId,
      ydoc,
    );

    // 👇 debugging ke liye
    window.provider = provider;

    provider.on("status", (e) => {
      console.log("YJS Status:", e.status);
    });

    // 👤 User setup
    const userData = JSON.parse(localStorage.getItem("user")) || {
      role: "guest",
    };

    const user = {
      name:
        userData.role === "mentor"
          ? "Mentor"
          : userData.role === "student"
            ? "Student"
            : "Guest",
      color:
        userData.role === "mentor"
          ? "#ff0000"
          : userData.role === "student"
            ? "#00ff00"
            : "#f59e0b",
    };

    // 👀 Awareness
    provider.awareness.setLocalStateField("user", user);

    // 🧾 Shared text
    const yText = ydoc.getText("monaco");

    // 🔗 Monaco binding
    new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness,
    );

    // 🔥 Focus trigger
    editor.focus();
    setTimeout(() => {
      editor.setPosition({ lineNumber: 1, column: 1 });
    }, 500);

    // 🔥 NAME LABEL FIX (IMPORTANT)
    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values());

      const names = states.map((s) => s?.user?.name).filter(Boolean);

      document.querySelectorAll(".yRemoteSelectionHead").forEach((el, i) => {
        if (names[i]) {
          el.setAttribute("data-name", names[i]);
        }
      });
    });
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      theme="vs-dark"
      value="" // ❌ defaultValue nahi use karna
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
        automaticLayout: true,
      }}
      onMount={handleEditorDidMount}
    />
  );
}

export default CodeEditor;
