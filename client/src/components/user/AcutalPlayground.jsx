import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { CodeXml, ChevronDown, Check, Loader2 } from "lucide-react";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import githubLight from "@shikijs/themes/github-light";
import githubDarkDefault from "@shikijs/themes/github-dark-default";
import vitesseLight from "@shikijs/themes/vitesse-light";
import materialThemeDarker from "@shikijs/themes/material-theme-darker";
import slackOchin from "@shikijs/themes/slack-ochin";
import catppuccinLatte from "@shikijs/themes/catppuccin-latte";
import slackDark from "@shikijs/themes/slack-dark";
import tokyoNight from "@shikijs/themes/tokyo-night";

import javascript from "@shikijs/langs/javascript";
import python from "@shikijs/langs/python";
import cpp from "@shikijs/langs/cpp";
import java from "@shikijs/langs/java";

const ActualPlayground = ({ problem, editorRef, onLangChange }) => {
  const [lang, setLang] = useState("C");
  const [theme, setTheme] = useState("github-light");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [highlighter, setHighlighter] = useState(null);

  const languages = ["C", "Python", "C++", "Java"];
  const langMap = {
    C: "c",
    Python: "python",
    "C++": "cpp",
    Java: "java",
  };

  useEffect(() => {
    if (onLangChange) onLangChange(lang);
  }, [lang, onLangChange]);

  const langIds = Object.values(langMap);

  const lightThemes = [
    "github-light",
    "catppuccin-latte",
    "vitesse-light",
    "slack-ochin",
  ];
  const darkThemes = [
    "slack-dark",
    "tokyo-night",
    "github-dark-default",
    "material-theme-darker",
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      const h = createHighlighterCoreSync({
        themes: [
          githubLight,
          githubDarkDefault,
          vitesseLight,
          materialThemeDarker,
          slackOchin,
          catppuccinLatte,
          tokyoNight,
          slackDark,
        ],
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
      case "C":
        return `// Sample C code
#include<stdio.h>
int main(){
  return printf("%d",name);
}`;
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

  const handleSelect = (type, value) => {
    if (type === "lang") setLang(value);
    else setTheme(value);
    setDropdownOpen(null);
  };

  const handleEditorBeforeMount = (monaco) => {
    if (!highlighter) return;
    langIds.forEach((id) => monaco.languages.register({ id }));
    shikiToMonaco(highlighter, monaco);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  if (!highlighter) {
    return (
      <div className="select-none h-full w-full border border-neutral-300 rounded-lg flex items-center justify-center bg-neutral-50">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="select-none h-full w-full border border-neutral-300 rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="w-full h-[45px] flex items-center justify-between border-b border-neutral-200 p-2 bg-white sticky top-0 z-20">
        <div className="h-full items-center flex gap-2">
          <div className="flex text-green-600">
            <CodeXml size={18} />
          </div>
          <span>Code</span>
        </div>

        <div className="flex gap-3 items-center">
          {/* Theme Dropdown */}

          <div className="flex gap-1.5 items-center dropdown-container">
            <span className="text-sm text-gray-600">Theme:</span>
            <div className="relative  border border-neutral-300 rounded-md">
              <div
                onClick={() =>
                  setDropdownOpen((prev) => (prev === "theme" ? null : "theme"))
                }
                className="flex px-2 gap-1 items-center py-1 hover:bg-neutral-200/60 rounded cursor-pointer"
              >
                <span className="text-sm capitalize">
                  {theme.replace(/-/g, " ")}
                </span>
                <ChevronDown size={16} />
              </div>

              {dropdownOpen === "theme" && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-neutral-300 rounded shadow-lg z-10 overflow-hidden">
                  {/* Light section */}
                  <div className="">
                    <div className="border-b border-neutral-200 p-2 px-3 text-xs uppercase text-neutral-500 font-medium bg-neutral-50">
                      Light Themes
                    </div>
                    <div className="py-0.5">
                      {lightThemes.map((t) => (
                        <div
                          key={t}
                          onClick={() => handleSelect("theme", t)}
                          className="px-3 text-base py-1 hover:bg-neutral-200/60 cursor-pointer flex justify-between items-center"
                        >
                          <span className="capitalize">
                            {t.replace(/-/g, " ")}
                          </span>
                          {theme === t && (
                            <Check size={16} className="text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dark section */}
                  <div>
                    <div className="p-2  px-3 text-xs uppercase text-neutral-500 font-medium bg-neutral-50 border-y border-neutral-200">
                      Dark Themes
                    </div>
                    <div className="py-0.5">
                      {darkThemes.map((t) => (
                        <div
                          key={t}
                          onClick={() => handleSelect("theme", t)}
                          className="px-3 text-base py-1 hover:bg-neutral-200/60 cursor-pointer flex justify-between items-center"
                        >
                          <span className="capitalize">
                            {t.replace(/-/g, " ")}
                          </span>
                          {theme === t && (
                            <Check size={16} className="text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language Dropdown */}

          <div className="dropdown-container relative border border-neutral-300 rounded-md ">
            <div
              onClick={() =>
                setDropdownOpen((prev) => (prev === "lang" ? null : "lang"))
              }
              className="flex gap-1 items-center px-2 py-1 hover:bg-neutral-200/60 rounded cursor-pointer"
            >
              <span className="text-sm">{lang}</span>
              <ChevronDown size={16} />
            </div>

            {dropdownOpen === "lang" && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-neutral-300 rounded shadow-lg z-10">
                {languages.map((l) => (
                  <div
                    key={l}
                    onClick={() => handleSelect("lang", l)}
                    className="px-4 py-1 hover:bg-neutral-200/60 cursor-pointer flex justify-between items-center"
                  >
                    <span>{l}</span>
                    {lang === l && (
                      <Check size={16} className="text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex items-center justify-center bg-neutral-50 overflow-auto">
        <Editor
          height="100%"
          value={getSampleCode(lang)}
          language={langMap[lang]}
          beforeMount={handleEditorBeforeMount}
          onMount={handleEditorMount}
          theme={theme}
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
