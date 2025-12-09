import { useEffect, useState, lazy, Suspense } from "react";
import { CodeXml, ChevronDown, Check } from "lucide-react";
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

// ⬇️ adjust this path to where your Loader is
import Loader from "../Loader";

// Lazy-load Monaco
const MonacoEditor = lazy(() => import("@monaco-editor/react"));

const SUPPORTED_LANG_IDS = ["c", "python", "cpp", "java"];

const languageConfig = {
    c: {
        label: "C",
        monaco: "c",
        sample: `// Sample C code
#include<stdio.h>
int main(){
    int name = 42;
    return printf("%d", name);
}`,
    },
    python: {
        label: "Python",
        monaco: "python",
        sample: `# Sample Python code
def greet(name):
    print(f"Hello, {name}!")

names = ["Alice", "Bob", "Charlie"]
for name in names:
    greet(name)`,
    },
    cpp: {
        label: "C++",
        monaco: "cpp",
        sample: `// Sample C++ code
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
}`,
    },
    java: {
        label: "Java",
        monaco: "java",
        sample: `// Sample Java code
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
}`,
    },
};

const ActualPlayground = ({
    problem,
    editorRef,
    languages = [],
    selectedLang,
    onLangChange,
}) => {
    const [theme, setTheme] = useState("github-light");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [highlighter, setHighlighter] = useState(null);
    const [code, setCode] = useState("");

    const effectiveLanguages =
        languages.length > 0 ? languages : SUPPORTED_LANG_IDS;

    const currentLangId =
        selectedLang && effectiveLanguages.includes(selectedLang)
            ? selectedLang
            : effectiveLanguages[0];

    const currentLangConfig = languageConfig[currentLangId] || {
        label: currentLangId?.toUpperCase() || "Language",
        monaco: currentLangId || "plaintext",
        sample: "",
    };

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

    const getProblemId = () => problem?._id || problem?.id || "default-problem";

    const getStorageKey = (problemId, languageId) =>
        `code:${problemId}:${languageId}`;

    const getSampleCode = (langId) => {
        return languageConfig[langId]?.sample || "";
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-container")) {
                setDropdownOpen(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
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

    useEffect(() => {
        if (!currentLangId) return;

        const problemId = getProblemId();
        const key = getStorageKey(problemId, currentLangId);

        try {
            const saved = window.localStorage.getItem(key);
            if (saved !== null) {
                setCode(saved);
            } else {
                setCode(getSampleCode(currentLangId));
            }
        } catch (e) {
            console.error("[DEBUG] Error reading from localStorage:", e);
            setCode(getSampleCode(currentLangId));
        }
    }, [problem?._id, problem?.id, currentLangId]);

    const handleSelect = (type, value) => {
        if (type === "lang") {
            onLangChange && onLangChange(value);
        } else {
            setTheme(value);
        }
        setDropdownOpen(null);
    };

    const handleEditorBeforeMount = (monaco) => {
        // Don't block if highlighter is not ready – just skip Shiki
        if (!highlighter) return;

        SUPPORTED_LANG_IDS.forEach((id) => monaco.languages.register({ id }));
        shikiToMonaco(highlighter, monaco);
    };

    const handleEditorMount = (editor) => {
        editorRef.current = editor;
    };

    const handleCodeChange = (value) => {
        const newCode = value ?? "";
        setCode(newCode);

        if (!currentLangId) return;

        const problemId = getProblemId();
        const key = getStorageKey(problemId, currentLangId);

        try {
            window.localStorage.setItem(key, newCode);
        } catch (e) {
            console.error("[DEBUG] Error writing to localStorage:", e);
        }
    };

    const renderEditorLoader = () => (
        <Loader
            text="Loading editor..."
            className="h-full w-full bg-neutral-50"
            textClassName="text-sm"
            color="black"
        />
    );

    return (
        <div className="select-none h-full w-full flex flex-col overflow-hidden">
            {/* Header / Navbar – always visible */}
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
                        <div className="relative border border-neutral-300 rounded-md">
                            <div
                                onClick={() =>
                                    setDropdownOpen((prev) =>
                                        prev === "theme" ? null : "theme",
                                    )
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
                                    <div>
                                        <div className="border-b border-neutral-200 p-2 px-3 text-xs uppercase text-neutral-500 font-medium bg-neutral-50">
                                            Light Themes
                                        </div>
                                        <div className="py-0.5">
                                            {lightThemes.map((t) => (
                                                <div
                                                    key={t}
                                                    onClick={() =>
                                                        handleSelect("theme", t)
                                                    }
                                                    className="px-3 text-base py-1 hover:bg-neutral-200/60 cursor-pointer flex justify-between items-center"
                                                >
                                                    <span className="capitalize">
                                                        {t.replace(/-/g, " ")}
                                                    </span>
                                                    {theme === t && (
                                                        <Check
                                                            size={16}
                                                            className="text-green-600"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="p-2 px-3 text-xs uppercase text-neutral-500 font-medium bg-neutral-50 border-y border-neutral-200">
                                            Dark Themes
                                        </div>
                                        <div className="py-0.5">
                                            {darkThemes.map((t) => (
                                                <div
                                                    key={t}
                                                    onClick={() =>
                                                        handleSelect("theme", t)
                                                    }
                                                    className="px-3 text-base py-1 hover:bg-neutral-200/60 cursor-pointer flex justify-between items-center"
                                                >
                                                    <span className="capitalize">
                                                        {t.replace(/-/g, " ")}
                                                    </span>
                                                    {theme === t && (
                                                        <Check
                                                            size={16}
                                                            className="text-green-600"
                                                        />
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
                    <div className="dropdown-container relative border border-neutral-300 rounded-md">
                        <div
                            onClick={() =>
                                setDropdownOpen((prev) =>
                                    prev === "lang" ? null : "lang",
                                )
                            }
                            className="flex gap-1 items-center px-2 py-1 hover:bg-neutral-200/60 rounded cursor-pointer"
                        >
                            <span className="text-sm">
                                {currentLangConfig.label}
                            </span>
                            <ChevronDown size={16} />
                        </div>

                        {dropdownOpen === "lang" && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-neutral-300 rounded shadow-lg z-10">
                                {effectiveLanguages.map((langId) => {
                                    const cfg = languageConfig[langId] || {
                                        label:
                                            langId?.toUpperCase() || "Unknown",
                                    };
                                    return (
                                        <div
                                            key={langId}
                                            onClick={() =>
                                                handleSelect("lang", langId)
                                            }
                                            className="px-4 py-1 hover:bg-neutral-200/60 cursor-pointer flex justify-between items-center"
                                        >
                                            <span>{cfg.label}</span>
                                            {currentLangId === langId && (
                                                <Check
                                                    size={16}
                                                    className="text-green-600"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor area – only ONE Loader via Suspense */}
            <div className="flex-1 flex items-center justify-center bg-neutral-50 overflow-auto">
                <Suspense fallback={renderEditorLoader()}>
                    <MonacoEditor
                        height="100%"
                        value={code}
                        language={currentLangConfig.monaco}
                        beforeMount={handleEditorBeforeMount}
                        onMount={handleEditorMount}
                        onChange={handleCodeChange}
                        theme={theme}
                        loading={null}
                        options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            autoIndent: "advanced",
                            formatOnPaste: true,
                            formatOnType: true,
                            automaticLayout: true,
                            fontSize: 15,
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
                </Suspense>
            </div>
        </div>
    );
};

export default ActualPlayground;
