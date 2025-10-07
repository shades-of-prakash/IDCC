import React, { useState } from "react";
import SplitPane from "react-split-pane";
import Editor from "@monaco-editor/react";

const CodeEditor = () => {
	const [code, setCode] = useState("// write your code here");
	const [language, setLanguage] = useState("javascript");

	const handleEditorChange = (value) => {
		setCode(value);
	};

	const handleRunCode = () => {
		console.log("Running code:", code);
		alert("Code sent to backend (simulation)");
	};

	return (
		<SplitPane split="vertical" minSize={200} defaultSize={400}>
			{/* Left Pane: Problem Statement */}
			<div
				style={{
					padding: "20px",
					background: "#f5f5f5",
					height: "100vh",
					overflow: "auto",
				}}
			>
				<h2>Problem Statement</h2>
				<p>Write a function that returns the sum of two numbers.</p>
			</div>

			{/* Right Pane: Editor */}
			<div
				style={{ height: "100vh", display: "flex", flexDirection: "column" }}
			>
				<div style={{ padding: "10px", background: "#eee" }}>
					<select
						value={language}
						onChange={(e) => setLanguage(e.target.value)}
					>
						<option value="javascript">JavaScript</option>
						<option value="python">Python</option>
						<option value="cpp">C++</option>
					</select>
					<button onClick={handleRunCode} style={{ marginLeft: "10px" }}>
						Run Code
					</button>
				</div>
				<Editor
					height="100%"
					defaultLanguage={language}
					language={language}
					value={code}
					onChange={handleEditorChange}
					theme="vs-dark"
					fontSize="14px"
				/>
			</div>
		</SplitPane>
	);
};

export default CodeEditor;
