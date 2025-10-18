import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import RichTextEditor from "./RichTextEditor";
import ProblemSidebar from "./ProblemSidebar";
import SampleCodePopup from "./SampleCodePopup";
import { toast } from "sonner";
import {
	ArrowRightToLine,
	X,
	Timer,
	User,
	FileQuestionMark,
	MoveLeft,
} from "lucide-react";

const extractImageUrls = (html) => {
	const div = document.createElement("div");
	div.innerHTML = html;
	const imgs = Array.from(div.getElementsByTagName("img"));
	return imgs.map((img) => img.src);
};

const cleanupUnusedImages = async (usedImages, id) => {
	try {
		await apiFetch("/api/upload/cleanup", {
			method: "POST",
			body: { usedImages, contestId: id },
		});
		console.log("✅ Cleanup complete");
	} catch (err) {
		console.warn("⚠️ Cleanup failed", err);
	}
};

const AddProblem = () => {
	const { id } = useParams();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [currentQ, setCurrentQ] = useState(0);
	const [showPopup, setShowPopup] = useState(false);
	const [questions, setQuestions] = useState([]);
	const [selectedLangs, setSelectedLangs] = useState([]);

	const allLanguages = [
		{ value: "python", label: "Python" },
		{ value: "cpp", label: "C++" },
		{ value: "java", label: "Java" },
		{ value: "c", label: "C" },
	];

	const {
		data: contest,
		isLoading: loading,
		error,
	} = useQuery({
		queryKey: ["contest", id],
		queryFn: () => apiFetch(`/api/contest/${id}`),
		enabled: !!id,
		suspense: true,
	});

	const submitQuestionMutation = useMutation({
		mutationFn: async ({ index, question }) => {
			return await apiFetch(`/api/contest/${id}/upsert`, {
				method: "POST",
				body: { index, question },
			});
		},
		onSuccess: () => {
			toast.success("Question saved successfully!");
			queryClient.invalidateQueries(["contest", id]);
		},
		onError: (err) => {
			toast.error(`Error: ${err.message}`);
		},
	});

	useEffect(() => {
		if (contest?.numberOfProblems) {
			let initialQuestions;
			if (contest.questions?.length > 0) {
				initialQuestions = contest.questions;
			} else {
				initialQuestions = Array.from(
					{ length: contest.numberOfProblems },
					() => ({
						name: "",
						points: "",
						statement: "",
						codes: {},
						visibleTests: "",
						hiddenTests: "",
						functionName: "",
						returnType: "",
						arguments: [{ name: "", type: "" }],
					})
				);
			}
			setQuestions(initialQuestions);
			setSelectedLangs([{ value: "c", label: "C" }]);
		}
	}, [contest]);

	const toggleLanguage = (lang) => {
		setSelectedLangs((prev) => {
			const exists = prev.find((l) => l.value === lang.value);
			if (exists) return prev.filter((l) => l.value !== lang.value);
			return [...prev, lang];
		});
	};

	const handleNameChange = (val) => {
		setQuestions((prev) =>
			prev.map((q, idx) => (idx === currentQ ? { ...q, name: val } : q))
		);
	};

	const handlePointsChange = (val) => {
		setQuestions((prev) =>
			prev.map((q, idx) => (idx === currentQ ? { ...q, points: val } : q))
		);
	};

	const handleStatementChange = (val) => {
		setQuestions((prev) =>
			prev.map((q, idx) => (idx === currentQ ? { ...q, statement: val } : q))
		);
	};

	const handleTestCaseChange = (field, val) => {
		setQuestions((prev) =>
			prev.map((q, idx) => (idx === currentQ ? { ...q, [field]: val } : q))
		);
	};

	const handleFunctionNameChange = (val) => {
		setQuestions((prev) =>
			prev.map((q, idx) => (idx === currentQ ? { ...q, functionName: val } : q))
		);
	};

	const handleReturnTypeChange = (val) => {
		setQuestions((prev) =>
			prev.map((q, idx) => (idx === currentQ ? { ...q, returnType: val } : q))
		);
	};

	const handleArgumentsChange = (args) => {
		setQuestions((prev) =>
			prev.map((q, idx) => (idx === currentQ ? { ...q, arguments: args } : q))
		);
	};

	const handleCodesChange = (codes) => {
		setQuestions((prev) =>
			prev.map((q, idx) => (idx === currentQ ? { ...q, codes } : q))
		);
	};

	const handleSubmit = async () => {
		const questionData = questions[currentQ];

		const requiredFields = [
			"name",
			"points",
			"arguments",
			"codes",
			"functionName",
			"hiddenTests",
			"visibleTests",
			"returnType",
			"statement",
		];

		const missingFields = requiredFields.filter(
			(f) =>
				!questionData[f] ||
				(Array.isArray(questionData[f]) && questionData[f].length === 0)
		);

		if (missingFields.length > 0) {
			toast.error(
				`Please fill all required fields: ${missingFields.join(", ")}`
			);
			return;
		}

		const usedImages = extractImageUrls(questionData.statement);
		await cleanupUnusedImages(usedImages, id);

		submitQuestionMutation.mutate({ index: currentQ, question: questionData });
	};

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			const hasUnsaved = questions.some(
				(q) =>
					q.statement || Object.keys(q.codes || {}).length || q.functionName
			);

			if (hasUnsaved) {
				const allUsed = questions.flatMap((q) => extractImageUrls(q.statement));
				navigator.sendBeacon(
					"/api/contest/images/cleanup",
					JSON.stringify({ usedImages: allUsed, contestId: id })
				);

				event.preventDefault();
				event.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [questions]);

	const totalQuestions = contest?.numberOfProblems || 0;

	if (loading || !contest) return null;
	if (error) return <div>Error loading contest</div>;

	return (
		<div className="w-full h-full flex flex-col items-center">
			<Header contest={contest} />

			<div className="w-full h-[calc(100%-4rem)] flex-col flex">
				<QuestionNavigation
					currentQ={currentQ}
					totalQuestions={totalQuestions}
					onQuestionChange={setCurrentQ}
					onSubmit={handleSubmit}
					selectedLangs={selectedLangs}
					allLanguages={allLanguages}
					onToggleLanguage={toggleLanguage}
				/>

				<div className="w-full h-[calc(100%-4rem)] flex">
					<div className="h-full w-[calc(100%-24rem)] p-2 pt-1 flex flex-col gap-2">
						<div className="h-12 flex gap-2">
							<div className="flex-1 relative">
											<input
											id="name"
											type="text"
											placeholder=" "
											value={questions[currentQ]?.name || ""}
											onChange={(e) => handleNameChange(e.target.value)}
											className={`peer w-full p-2 border border-gray-300 rounded-md focus:outline-none 
											focus:ring-px focus:ring-black focus:border-black transition`}
											/>
											<label
											htmlFor="name"
											className={`absolute left-2 px-1 bg-white text-gray-500 text-sm transition-all duration-200 
												peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
												peer-focus:-top-2 peer-focus:text-black peer-focus:text-sm
												${questions[currentQ]?.name ? "-top-2 text-black text-sm" : ""}`}
											>
											Question Name
											</label>
							</div>
							<div className="w-32 relative">
											<input
											id="points"
											type="number"
											min="0"
											placeholder=" "
											value={questions[currentQ]?.points || ""}
											onChange={(e) => handlePointsChange(e.target.value)}
											className="peer w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-px focus:ring-black focus:border-black transition"
											/>
											<label
											htmlFor="points"
											className={`absolute left-2 px-1 bg-white text-gray-500 text-sm transition-all duration-200 
												peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
												peer-focus:-top-2 peer-focus:text-black peer-focus:text-sm
												${questions[currentQ]?.points ? "-top-2 text-black text-sm" : ""}`}
											>
											Points
											</label>
							</div>
						</div>
						<div className="w-full h-[calc(100%-3rem)]">
								<RichTextEditor
									value={questions[currentQ]?.statement || ""}
									onChange={handleStatementChange}
								/>
						</div>
					</div>

					<ProblemSidebar
						functionName={questions[currentQ]?.functionName || ""}
						returnType={questions[currentQ]?.returnType || ""}
						arguments={questions[currentQ]?.arguments || [{ name: "", type: "" }]}
						codes={questions[currentQ]?.codes || {}}
						visibleTests={questions[currentQ]?.visibleTests || ""}
						hiddenTests={questions[currentQ]?.hiddenTests || ""}
						onFunctionNameChange={handleFunctionNameChange}
						onReturnTypeChange={handleReturnTypeChange}
						onArgumentsChange={handleArgumentsChange}
						onCodesChange={handleCodesChange}
						onVisibleTestsChange={(val) =>
							handleTestCaseChange("visibleTests", val)
						}
						onHiddenTestsChange={(val) =>
							handleTestCaseChange("hiddenTests", val)
						}
						onAddSampleCode={() => setShowPopup(true)}
						onSubmitQuestion={handleSubmit}
						currentQ={currentQ}
					/>
				</div>
			</div>

			<SampleCodePopup
				show={showPopup}
				onClose={() => setShowPopup(false)}
				currentQ={currentQ}
				questions={questions}
				onUpdateQuestions={setQuestions}
				selectedLangs={selectedLangs}
				onCodesChange={handleCodesChange}
			/>
		</div>
	);
};

const Header = ({ contest }) => {
	const navigate = useNavigate();

	return (
		<div className="w-full h-16 border-b border-neutral-300 flex items-center justify-between px-4">
			<div className="flex items-center gap-3">
				<div
					onClick={() => navigate(-1)}
					className="w-12 h-12 text-black flex items-center justify-center border border-neutral-300 rounded cursor-pointer hover:bg-neutral-100"
				>
					<MoveLeft />
				</div>
				<div className="w-12 h-12 border border-neutral-800/30 py-1">
					{contest?.bannerImage && (
						<img
							src={`${import.meta.env.VITE_BACKEND_URL}${contest.bannerImage}`}
							alt={contest.name}
							className="w-full h-full object-contain rounded"
						/>
					)}
				</div>
				<div className="flex flex-col">
					<div className="w-full flex items-center gap-2">
						<h1 className="text-lg font-semibold text-neutral-900">
							Add Problems to
						</h1>
						<span className="text-sm text-neutral-600">
							<span className="font-medium text-blue-600">{contest?.name}</span>
						</span>
						<span className="text-sm text-neutral-600">
							by {contest?.conductedBy}
						</span>
					</div>
					<p className="text-sm text-neutral-500 hidden sm:block">
						Create and manage problems for your contest.
					</p>
				</div>
			</div>
			<div className="flex gap-2">
				<span className="flex gap-1 items-center">
					<Timer size={16} />
					{contest?.durationMinutes} m
				</span>
				<div className="w-px bg-neutral-800/30 h-8"></div>
				<span className="flex gap-1 items-center">
					<User size={16} />: {contest?.teamSize}
				</span>
				<div className="w-px bg-neutral-800/30 h-8"></div>
				<span className="flex gap-1 items-center">
					<FileQuestionMark size={16} />: {contest?.numberOfProblems}
				</span>
				<span
					className={`ml-3 flex items-center font-bold border-neutral-300 border justify-center py-2 px-4 rounded-full text-xs ${
						contest.numberOfProblems !== contest.questions?.length
							? "bg-red-100 text-red-700"
							: "bg-green-100 text-green-700"
					}`}
					title="All contest questions must be posted for them to appear in the live contest."
				>
					{contest.numberOfProblems !== contest.questions?.length
						? "Incomplete"
						: "Completed"}
				</span>
			</div>
		</div>
	);
};

const QuestionNavigation = ({
	currentQ,
	totalQuestions,
	onQuestionChange,
	selectedLangs,
	allLanguages,
	onToggleLanguage,
}) => (
	<div className="w-full h-16 border-r border-neutral-300 p-2 flex items-center justify-between gap-4">
		<div className="h-full flex items-center gap-2">
			<div className="w-full flex gap-1 justify-between">
				<div className="h-10 flex gap-2 items-center px-3 rounded border border-neutral-800/30 text-neutral-800 font-semibold">
					Questions <ArrowRightToLine size={16} />
				</div>
				<div className="w-full h-full flex items-center gap-2 px-2 overflow-x-auto">
					{Array.from({ length: totalQuestions }, (_, i) => (
						<div
							key={i}
							onClick={() => onQuestionChange(i)}
							className={`cursor-pointer border w-10 h-10 flex items-center justify-center rounded flex-shrink-0 ${
								currentQ === i
									? "bg-black text-white"
									: "bg-white text-black hover:bg-black hover:text-white"
							}`}
						>
							{i + 1}
						</div>
					))}
				</div>
			</div>
		</div>

		<div className="flex items-center gap-2">
			<label className="text-sm font-medium text-gray-700">
				Select Languages
			</label>
			<div className="flex flex-wrap gap-2">
				{allLanguages.map((lang) => {
					const isSelected = selectedLangs.find((l) => l.value === lang.value);
					return (
						<button
							key={lang.value}
							onClick={() => onToggleLanguage(lang)}
							className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition ${
								isSelected
									? "bg-blue-100 text-blue-700 border-blue-300 font-medium"
									: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
							}`}
						>
							{lang.label}
							{isSelected && <X className="w-3 h-3" />}
						</button>
					);
				})}
			</div>
		</div>
	</div>
);

export default AddProblem;
