import React, { useState } from "react";
import { FileCode, Maximize, X } from "lucide-react";
import Editor from "@monaco-editor/react";

const JsonEditor = ({ value, onChange, placeholder, loader }) => {
	const [isEditorReady, setIsEditorReady] = useState(false);

	const handleEditorDidMount = (editor) => {
		editor
			.getAction("editor.action.formatDocument")
			.run()
			.then(() => editor.focus());

		setIsEditorReady(true); // Editor is loaded
	};

	return (
		<div
			className={`relative w-full border border-neutral-400 rounded-lg overflow-hidden h-full`}
		>
			{!isEditorReady && (
				<div className="absolute inset-0 flex items-center justify-center bg-white z-10">
					<div className="w-10 h-10 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin"></div>
				</div>
			)}
			<Editor
				placeholder={placeholder}
				onChange={(val) => onChange(val)}
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
					lineDecorationsWidth: 0,
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
const ProblemSidebar = ({
	visibleTests,
	hiddenTests,
	onVisibleTestsChange,
	onHiddenTestsChange,
	onAddSampleCode,
	onSubmitQuestion,
	currentQ,
}) => (
	<div className="h-full w-[24rem] py-1 pr-1 pt-0">
		<div className="w-full h-full border border-neutral-800/30 text-black rounded p-4 flex flex-col gap-3 overflow-y-auto">
			{/* Sample Code Popup Trigger */}
			<div className="flex flex-col gap-1">
				<label className="text-xs text-gray-600">
					Add sample code for selected languages; shown per participant choice.
				</label>
				<button
					onClick={onAddSampleCode}
					className="w-full py-2 rounded-lg border border-neutral-300 bg-white hover:bg-gray-50 text-gray-800 font-medium flex items-center justify-center gap-2 transition"
				>
					<FileCode className="w-4 h-4" />
					Add Sample Code
				</button>
			</div>

			{/* Visible Test Cases */}
			<TestCasesSection
				title="Visible Test Cases"
				description="Shown to participants during contest. Use for sample test cases."
				formatColor="bg-blue-100 text-blue-700"
				formatText="JSON Format"
				value={visibleTests}
				onChange={onVisibleTestsChange}
				placeholder='[{"input": "1 2", "output": "3"}]'
			/>

			{/* Hidden Test Cases */}
			<TestCasesSection
				title="Hidden Test Cases"
				description="Hidden from participants. Used for final evaluation."
				formatColor="bg-amber-100 text-amber-700"
				formatText="JSON Format"
				value={hiddenTests}
				onChange={onHiddenTestsChange}
				placeholder='[{"input": "100 200", "output": "300"}]'
			/>

			{/* Submit */}
			<button
				onClick={onSubmitQuestion}
				className="w-full py-2 rounded bg-green-500 hover:bg-green-600 text-white font-medium"
			>
				Submit Question {currentQ + 1}
			</button>
		</div>
	</div>
);

const TestCasesSection = ({
	title,
	description,
	formatColor,
	formatText,
	value,
	onChange,
	placeholder,
}) => {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const bgColor =
		title === "Visible Test Cases" ? "bg-blue-50/30" : "bg-amber-50/30";

	return (
		<>
			<div className="flex flex-col gap-1">
				<div className="flex items-center justify-between">
					<label className="text-sm font-semibold text-neutral-800">
						{title}
					</label>
					<div className="flex gap-1 items-center">
						<span
							className={`text-xs px-2 py-0.5 ${formatColor} text-neutral-700 rounded-full font-medium`}
						>
							{formatText}
						</span>
						<span
							className={`text-xs px-2 py-0.5 ${formatColor} text-neutral-700 rounded-full font-medium`}
						>
							{title === "Visible Test Cases" ? "Public" : "Private"}
						</span>
						<button
							onClick={() => setIsFullscreen(true)}
							className="ml-1 p-1 rounded hover:bg-neutral-200 transition-all"
							title="Fullscreen"
						>
							<Maximize size={18} />
						</button>
					</div>
				</div>
				<div className="h-[134px] w-full">
					<JsonEditor
						value={value}
						onChange={onChange}
						placeholder={placeholder}
					/>
				</div>
				<p className="text-xs text-neutral-500 leading-relaxed">
					{description}
				</p>
			</div>

			{isFullscreen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-opacity duration-300 ease-in-out">
					<div className="relative w-[800px] h-[600px] bg-white rounded shadow-lg p-4 flex flex-col">
						{/* Header */}
						<div className="flex items-center justify-between mb-2">
							<h2 className="text-sm font-semibold text-neutral-800 gap-1.5 flex items-center">
								<span>{title}</span>
								<span
									className={`text-xs px-2 py-0.5 ${formatColor} text-neutral-700 rounded-full font-medium`}
								>
									{formatText}
								</span>
								<span
									className={`text-xs px-2 py-0.5 ${formatColor} text-neutral-700 rounded-full font-medium`}
								>
									{title === "Visible Test Cases" ? "Public" : "Private"}
								</span>
							</h2>
							<button
								onClick={() => setIsFullscreen(false)}
								className="top-2 right-2 p-1 rounded hover:bg-neutral-200 transition-all"
							>
								<X size={18} />
							</button>
						</div>

						{/* Fullscreen JSON Editor */}
						<div className="relative flex-1">
							<JsonEditor
								value={value}
								onChange={onChange}
								placeholder={placeholder}
								height="h-full"
							/>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ProblemSidebar;
