const JsonEditor = ({ value, onChange, placeholder }) => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const handleEditorDidMount = (editor) => {
    editor
      .getAction("editor.action.formatDocument")
      .run()
      .then(() => editor.focus());
    setIsEditorReady(true);
  };
  return (
    <div className="relative w-full border border-neutral-400 rounded-lg overflow-hidden h-full">
      {!isEditorReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="w-10 h-10 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Editor
        placeholder={placeholder}
        onChange={onChange}
        height="100%"
        language="json"
        theme="vs"
        fontSize={14}
        value={
          typeof value === "string" ? value : JSON.stringify(value, null, 2)
        }
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          autoIndent: "advanced",
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          lineNumbersMinChars: 2,
          glyphMargin: false,
          tabSize: 8,
          insertSpaces: true,
          quickSuggestions: true,
          folding: true,
          detectIndentation: false,
          trimAutoWhitespace: false,
          lineHeight: 22,
        }}
      />
    </div>
  );
};
