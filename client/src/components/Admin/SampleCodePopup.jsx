import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Editor } from "@monaco-editor/react";

const SampleCodePopup = ({
	show,
	onClose,
	currentQ,
	questions,
	onUpdateQuestions,
	selectedLangs,
}) => {
	if (!show) return null;

	const defaultQuestion = {
		statement: "",
		codes: {},
		visibleTests: "",
		hiddenTests: "",
		functionName: "",
		returnType: "",
		arguments: [{ name: "", type: "" }],
	};

	const currentQuestion = questions[currentQ] || defaultQuestion;

	const handleCodeChange = (lang, val) => {
		onUpdateQuestions((prev) =>
			prev.map((q, idx) => {
				if (idx !== currentQ) return q;
				return { ...q, codes: { ...q.codes, [lang]: val } };
			})
		);
	};

	const handleFunctionChange = (field, val) => {
		onUpdateQuestions((prev) =>
			prev.map((q, idx) => {
				if (idx !== currentQ) return q;
				return { ...q, [field]: val };
			})
		);
	};

	const handleArgumentChange = (argIdx, field, val) => {
		onUpdateQuestions((prev) =>
			prev.map((q, idx) => {
				if (idx !== currentQ) return q;
				const newArgs = [...q.arguments];
				newArgs[argIdx] = { ...newArgs[argIdx], [field]: val };
				return { ...q, arguments: newArgs };
			})
		);
	};

	const addArgument = () => {
		onUpdateQuestions((prev) =>
			prev.map((q, idx) => {
				if (idx !== currentQ) return q;
				return { ...q, arguments: [...q.arguments, { name: "", type: "" }] };
			})
		);
	};

	const removeArgument = (argIdx) => {
		onUpdateQuestions((prev) =>
			prev.map((q, idx) => {
				if (idx !== currentQ) return q;
				return {
					...q,
					arguments: q.arguments.filter((_, i) => i !== argIdx),
				};
			})
		);
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg w-[600px] max-h-[90vh] flex flex-col shadow-lg">
				{/* Header (Sticky Top) */}
				<div className="rounded sticky top-0 bg-white z-10 gap-3 flex justify-between items-center flex-col border-b px-6 py-3">
					<div className="w-full flex justify-between py-2">
						<h2 className="text-lg font-semibold">
							Add Sample Code (Q{currentQ + 1})
						</h2>
						<button onClick={onClose}>
							<X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
						</button>
					</div>
					<div>
						<p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
							Add sample code for all selected languages. They will be shown in
							the editor based on the user's selected language.
						</p>
					</div>
				</div>

				{/* Scrollable Content */}
				<div className="overflow-auto h-[550px] flex-1 px-6 py-2 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-400">
					<FunctionSignatureSection
						functionName={currentQuestion.functionName}
						returnType={currentQuestion.returnType}
						arguments={currentQuestion.arguments}
						onFunctionNameChange={(val) =>
							handleFunctionChange("functionName", val)
						}
						onReturnTypeChange={(val) =>
							handleFunctionChange("returnType", val)
						}
						onArgumentChange={handleArgumentChange}
						onAddArgument={addArgument}
						onRemoveArgument={removeArgument}
					/>

					{selectedLangs.map((lang) => (
						<CodeSection
							key={lang.value}
							lang={lang}
							code={currentQuestion.codes[lang.value] || ""}
							onCodeChange={handleCodeChange}
						/>
					))}
				</div>

				{/* Footer (Sticky Bottom) */}
				<div className="rounded sticky bottom-0 bg-white z-10 border-t px-6 py-3">
					<button
						onClick={onClose}
						className="w-full py-2.5 rounded bg-black/90 hover:bg-black text-white font-medium transition"
					>
						Save Code
					</button>
				</div>
			</div>
		</div>
	);
};

const FunctionSignatureSection = ({
	functionName,
	returnType,
	arguments: args,
	onFunctionNameChange,
	onReturnTypeChange,
	onArgumentChange,
	onAddArgument,
	onRemoveArgument,
}) => (
	<div className="flex flex-col gap-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
		<h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
			Function Signature
		</h3>

		<div className="grid grid-cols-2 gap-2">
			<div className="flex flex-col gap-1.5">
				<label className="text-xs font-medium text-gray-600">
					Function Name
				</label>
				<input
					type="text"
					className="w-full px-3 py-2 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
					placeholder="e.g., addNumbers"
					value={functionName}
					onChange={(e) => onFunctionNameChange(e.target.value)}
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className="text-xs font-medium text-gray-600">Return Type</label>
				<input
					type="text"
					className="w-full px-3 py-2 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
					placeholder="e.g., int, string"
					value={returnType}
					onChange={(e) => onReturnTypeChange(e.target.value)}
				/>
			</div>
		</div>

		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<label className="text-xs font-medium text-gray-600">
					Arguments / Parameters
				</label>
				<button
					onClick={onAddArgument}
					className="text-xs px-3 py-1 rounded bg-black/90 hover:bg-black text-white font-medium transition"
				>
					+ Add Argument
				</button>
			</div>

			<div className="flex flex-col gap-2">
				{args.map((arg, idx) => (
					<div key={idx} className="flex items-center gap-2 bg-white">
						<div className="flex items-center gap-2 flex-1">
							<input
								type="text"
								className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 outline-none"
								placeholder="Type (e.g., int)"
								value={arg.type}
								onChange={(e) => onArgumentChange(idx, "type", e.target.value)}
							/>
							<input
								type="text"
								className="flex-1 px-2 py-1.5 rounded border border-gray-300 text-sm font-mono focus:border-blue-500 outline-none"
								placeholder="Name (e.g., num)"
								value={arg.name}
								onChange={(e) => onArgumentChange(idx, "name", e.target.value)}
							/>
						</div>
						{args.length > 1 && (
							<button
								onClick={() => onRemoveArgument(idx)}
								className="p-2 bg-red-100 hover:bg-red-200 rounded transition"
							>
								<X className="w-4 h-4 text-red-600" />
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	</div>
);

const CodeSection = ({ lang, code, onCodeChange }) => {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm font-medium text-gray-800">
				{lang.label} Code
			</span>
			<div className="w-full h-[200px]  border border-neutral-300 rounded">
				<Editor
					height="100%"
					language={lang.value}
					theme="vs"
					value={code}
					onChange={(val) => onCodeChange(lang.value, val)}
					options={{
						minimap: { enabled: false },
						scrollBeyondLastLine: false,
						wordWrap: "on",
						autoIndent: "advanced",
						formatOnPaste: true,
						formatOnType: true,
						automaticLayout: true,
						fontSize: 14,
						lineNumbersMinChars: 2,
						lineDecorationsWidth: 0,
						glyphMargin: false,
						tabSize: 4,
						insertSpaces: true,
						quickSuggestions: true,
						folding: true,
						detectIndentation: false,
						trimAutoWhitespace: false,
						lineHeight: 22,
					}}
				/>
			</div>
		</div>
	);
};

export default SampleCodePopup;
