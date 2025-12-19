import { useRef, useState } from "react";

import logoIcon from "../../assets/images/logo.webp";
import codeEditor from "../../assets/walk/code-editor.png";
import Tab from "../../assets/walk/tab.png";

import LanguageImg from "../../assets/walk/language.png";
import ThemeImg from "../../assets/walk/theme.png";
import SubmitImg from "../../assets/walk/submit.png";
import ListImg from "../../assets/walk/list.png";
import FinishImg from "../../assets/walk/finish.png";

// Reusable Tailwind classes for entry animations
const FADE_UP =
    "transition-all duration-700 ease-out translate-y-0 opacity-100";
const FADE_HIDDEN = "translate-y-8 opacity-0";

const HeroSlide = ({ title, description, mediaUrl }) => (
    <section className="h-full w-full snap-start relative overflow-hidden flex flex-col items-center bg-white p-6 lg:p-12">
        <div className="text-center mb-6 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-tight mb-4">
                {title}
            </h2>
            <p className="text-lg lg:text-xl text-neutral-500 font-medium leading-relaxed">
                {description}
            </p>
        </div>

        <div className="w-full max-w-7xl flex-1">
            <div className="w-full h-full bg-gradient-to-b from-neutral-800 to-black p-2 lg:p-3 rounded-[2.5rem] shadow-2xl border border-neutral-200 overflow-hidden relative animate-in zoom-in-95 duration-1000">
                <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10 bg-black">
                    <img
                        src={mediaUrl}
                        alt={title}
                        className="w-full h-full object-top object-cover"
                    />
                </div>
            </div>
        </div>
    </section>
);

const MediaSlide = ({
    title,
    description,
    points,
    mediaUrl,
    imagePosition,
}) => {
    const isImageRight = imagePosition === "right";
    return (
        <section className="min-h-full w-full flex items-center px-10 lg:px-20 snap-start overflow-hidden bg-white">
            <div
                className={`flex flex-col items-center max-w-7xl w-full gap-12 lg:gap-20 ${isImageRight ? "lg:flex-row-reverse" : "lg:flex-row"} text-left`}
            >
                <div className="w-full lg:w-[60%]">
                    <div className="bg-gradient-to-b from-neutral-800 to-black h-[400px] lg:h-[550px] p-2 rounded-3xl shadow-2xl border border-neutral-200 relative overflow-hidden transition-transform hover:scale-[1.01] duration-500">
                        <div className="w-full h-full rounded-[1.25rem] overflow-hidden border border-white/10 bg-black">
                            <img
                                src={mediaUrl}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[40%]">
                    <h2 className="text-4xl font-bold mb-6 text-neutral-900 tracking-tight leading-[1.1]">
                        {title}
                    </h2>
                    <p className="text-lg lg:text-lg font-medium text-neutral-600 leading-relaxed mb-10">
                        {description}
                    </p>
                    <div className="space-y-4">
                        {points.map((point, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 text-base font-medium text-neutral-700 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 backdrop-blur-sm"
                            >
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                                {point}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const CenteredSlide = ({ title, subheading, description, logo }) => (
    <section className="min-h-full w-full flex items-center px-10 lg:px-20 snap-start overflow-hidden bg-white">
        <div className="max-w-3xl w-full text-center mx-auto">
            {logo && (
                <div className="h-20 w-20 border border-neutral-200 pr-1 pt-1 overflow-hidden rounded-3xl mb-8 shadow-sm mx-auto">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-full w-full object-contain"
                    />
                </div>
            )}
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-neutral-900 tracking-tight">
                {title}
            </h2>
            {subheading && (
                <p className="text-2xl lg:text-3xl font-medium text-neutral-500 mb-6 tracking-tight">
                    {subheading}
                </p>
            )}
            <p className="text-lg lg:text-xl text-neutral-600 leading-relaxed">
                {description}
            </p>
        </div>
    </section>
);

const SlideSection = ({ slide }) => {
    if (slide.type === "hero") return <HeroSlide {...slide} />;
    if (!slide.mediaUrl) return <CenteredSlide {...slide} />;
    return <MediaSlide {...slide} />;
};

const SLIDES = [
    {
        title: "Logiq by IDCC",
        subheading: "Interactive Coding Editor Tour",
        logo: logoIcon,
        description:
            "Logiq by IDCC is a coding contest platform where you can challenge your technical knowledge.",
        points: [],
    },
    {
        title: "Code Editor",
        description: "Your journey to the top of the leaderboard starts here.",
        type: "hero",
        mediaUrl: codeEditor,
        points: [],
    },
    {
        title: "Language Selector",
        description:
            "Seamlessly switch between supported programming languages.",
        points: [
            "Multiple language support",
            "Auto-loaded templates",
            "Persistent code per switch",
        ],
        mediaUrl: LanguageImg,
        imagePosition: "left",
    },
    {
        title: "Theme & Appearance",
        description: "Personalize your coding environment.",
        points: [
            "Light and dark themes",
            "Syntax-aware schemes",
            "Instant switching",
        ],
        mediaUrl: ThemeImg,
        imagePosition: "right",
    },
    {
        title: "Submit Solution",
        description: "Submit your code for full evaluation.",
        points: [
            "Hidden test case validation",
            "Memory & Time measurement",
            "Instant score updates",
        ],
        mediaUrl: SubmitImg,
        imagePosition: "left",
    },
    {
        title: "Problem List",
        description: "Track your progress at a glance.",
        points: [
            "Clear status indicators",
            "Quick navigation",
            "Progress visibility",
        ],
        mediaUrl: ListImg,
        imagePosition: "right",
    },
    {
        title: "Finish & Review",
        description: "Review your status before final confirmation.",
        points: [
            "Submission summary",
            "One-click navigation",
            "Final review step",
        ],
        mediaUrl: FinishImg,
        imagePosition: "left",
    },
    {
        title: "Tab Switch Limit",
        description: "To ensure fair play, tab switching is limited.",
        points: [
            "3 switches maximum",
            "Real-time monitoring",
            "Auto-submission trigger",
        ],
        mediaUrl: Tab,
        imagePosition: "right",
    },
];

const EditorWalkthrough = ({ onFinish }) => {
    const containerRef = useRef(null);
    const [index, setIndex] = useState(0);

    const scrollToIndex = (i) => {
        if (!containerRef.current) return;
        containerRef.current.scrollTo({
            top: containerRef.current.clientHeight * i,
            behavior: "smooth",
        });
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-white font-sans antialiased overflow-hidden">
            <div
                ref={containerRef}
                className="h-[calc(100vh-4.5rem)] w-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
                onScroll={(e) => {
                    const i = Math.round(
                        e.currentTarget.scrollTop /
                            e.currentTarget.clientHeight,
                    );
                    if (i !== index) setIndex(i);
                }}
            >
                {SLIDES.map((slide, i) => (
                    <SlideSection key={i} slide={slide} />
                ))}
            </div>

            <div className="h-18 w-full bg-white/80 backdrop-blur-md border-t border-neutral-100 flex items-center justify-between px-10 lg:px-20 mt-2 z-20">
                <button
                    onClick={() => onFinish?.()}
                    className="px-8 py-2.5 rounded-xl border border-gray-300 font-bold text-neutral-500 hover:bg-neutral-100 transition-colors active:scale-95"
                >
                    Skip
                </button>

                <div className="flex gap-4">
                    <button
                        disabled={index === 0}
                        onClick={() => scrollToIndex(index - 1)}
                        className="px-8 py-2.5 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 disabled:opacity-20 transition-colors active:scale-95"
                    >
                        Back
                    </button>
                    <button
                        onClick={() =>
                            index === SLIDES.length - 1
                                ? onFinish?.()
                                : scrollToIndex(index + 1)
                        }
                        className="px-10 py-2.5 bg-neutral-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        {index === SLIDES.length - 1 ? "Finish" : "Continue"}
                    </button>
                </div>
            </div>

            {/* Pagination Dots - Simplified for Windows 7 Performance */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
                {SLIDES.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                            index === i
                                ? "h-8 bg-neutral-900"
                                : "h-2 bg-neutral-200"
                        }`}
                        onClick={() => scrollToIndex(i)}
                    />
                ))}
            </div>
        </div>
    );
};

export default EditorWalkthrough;
