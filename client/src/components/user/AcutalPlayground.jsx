import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { CodeXml, ChevronDown, Check, Loader2 } from "lucide-react";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Static imports for pre-bundling (direct subpath exports, no /dist or /index.js)
import githubLight from "@shikijs/themes/github-light";
import javascript from "@shikijs/langs/javascript";
import python from "@shikijs/langs/python";
import cpp from "@shikijs/langs/cpp";
import java from "@shikijs/langs/java";

const ActualPlayground = () => {
  const [lang, setLang] = useState("Javascript");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlighter, setHighlighter] = useState(null);

  const languages = ["Javascript", "Python", "C++", "Java"];
  const langMap = {
    "Javascript": "javascript",
    "Python": "python",
    "C++": "cpp",
    "Java": "java",
  };
  const langIds = Object.values(langMap);

  useEffect(() => {
    try {
      const h = createHighlighterCoreSync({
        themes: [githubLight],
        langs: [javascript, python, cpp, java],
        engine: createJavaScriptRegexEngine(),
      });
      setHighlighter(h);
    } catch (e) {
      console.error("[DEBUG] Highlighter sync creation error:", e);
    }
  }, []);

  const getSampleCode = (selectedLang) => {
    switch (selectedLang) {
      case "Javascript":
        return `// Sample JavaScript code
function greet(name) {
  console.log("Hello, " + name + "!");
}

const names = ["Alice", "Bob", "Charlie"];
names.forEach(greet);`;
      case "Python":
        return `# Sample Python code
def greet(name):
    print(f"Hello, {name}!")

names = ["Alice", "Bob", "Charlie"]
for name in names:
    greet(name)`;
      case "C++":
        return `// Sample C++ code
#include <iostream>
#include <vector>
#include <string>

int main() {
    auto greet = [](const std::string& name) {
        std::cout << "Hello, " << name << "!" << std::endl;
    };

    std::vector<std::string> names = {"Alice", "Bob", "Charlie"};
    for (const auto& name : names) {
        greet(name);
    }

    return 0;
}`;
      case "Java":
        return `// Sample Java code
import java.util.Arrays;
import java.util.List;

public class HelloWorld {
    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
        names.forEach(HelloWorld::greet);
    }
}`;
      default:
        return "";
    }
  };

  const handleSelect = (selected) => {
    setLang(selected);
    setDropdownOpen(false);
  };

  const handleEditorBeforeMount = (monaco) => {
    console.log("[DEBUG] Monaco before mount");
    if (!highlighter) return;

    langIds.forEach((id) => monaco.languages.register({ id }));
    shikiToMonaco(highlighter, monaco);
    console.log("[DEBUG] Shiki themes registered synchronously");
  };

  if (!highlighter) {
    return (
      <div className="select-none h-full w-full border border-neutral-300 rounded-lg flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className=" select-none h-full w-full border border-neutral-300 rounded-lg flex flex-col overflow-hidden">
<div className="w-full h-10 flex items-center justify-between border-b border-neutral-200 p-2 bg-white sticky top-0 z-20">
        <div className="h-full items-center flex gap-2">
          <div className="flex text-green-600">
            <CodeXml size={18} />
          </div>
          <span>Code</span>
        </div>

        <div className="relative">
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex gap-1 items-center p-1 hover:bg-neutral-200/60 rounded cursor-pointer"
          >
            <span className="text-sm">{lang}</span>
            <ChevronDown size={16} />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-neutral-300 rounded shadow-lg z-10">
              {languages.map((l) => (
                <div
                  key={l}
                  onClick={() => handleSelect(l)}
                  className="px-4 py-1 hover:bg-neutral-200/60 cursor-pointer flex justify-between items-center"
                >
                  <span>{l}</span>
                  {lang === l && <Check size={16} className="text-green-600" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className=" flex-1 flex items-center justify-center bg-neutral-50  overflow-auto">
        <Editor
          height="100%"
          value={getSampleCode(lang)}
          language={langMap[lang]}
          beforeMount={handleEditorBeforeMount}
          theme="github-light"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            autoIndent: "advanced",
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
            fontSize: 16,
            lineNumbersMinChars: 2,
            lineDecorationsWidth: 0,
            glyphMargin: false,
            tabSize: 4,
            insertSpaces: true,
            quickSuggestions: false,
            folding: true,
            detectIndentation: false,
            trimAutoWhitespace: false,
            lineHeight: 22,
            fontFamily: "'Geist Mono', monospace",
            fontLigatures: true,
            contextmenu: false,
            renderLineHighlight: "none",
            renderLineHighlightOnlyWhenFocus: false,
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: "off",
            parameterHints: { enabled: false },
            lightbulb: { enabled: false },
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
};

export default ActualPlayground;