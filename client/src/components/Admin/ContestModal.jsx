import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomSelect from "../CustomSelect";

const ContestModal = ({ close }) => {
	const [name, setName] = useState("");
	const [conductedBy, setConductedBy] = useState("IDCC");
	const [numberOfProblems, setNumberOfProblems] = useState("");
	const [durationMinutes, setDurationMinutes] = useState("");
	const [teamSize, setTeamSize] = useState(null);
	const [file, setFile] = useState(null);

	const TeamSizeOptions = [
		{ value: "Individual", label: "Individual" },
		{ value: "Team", label: "Team" },
	];

	const handleFileChange = (e) => {
		const uploaded = e.target.files[0];
		if (uploaded) setFile(uploaded);
	};

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (newContest) => {
			const formData = new FormData();
			Object.entries(newContest).forEach(([key, value]) => {
				console.log(key, value);
				if (value !== undefined && value !== null) {
					formData.append(key, value);
				}
			});
			console.log("formdata");

			if (file) formData.append("bannerImage", file);

			for (let i of formData.entries()) {
				console.log(i);
			}

			const res = await fetch("/api/contest/create", {
				method: "POST",
				body: formData,
			});
			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(errData.message || "Failed to create contest");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contests"] });
			close(false);
		},
	});

	const handleSubmit = () => {
		mutation.mutate({
			name,
			conductedBy,
			numberOfProblems: Number(numberOfProblems),
			durationMinutes: Number(durationMinutes),
			teamSize: teamSize?.value || "individual",
		});
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
			<div className="w-[500px] bg-white rounded-lg shadow-lg overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<h2 className="text-lg font-semibold text-gray-800">
						Create Contest
					</h2>
					<button
						onClick={() => close(false)}
						className="text-gray-500 hover:text-gray-800"
					>
						✕
					</button>
				</div>

				<div className="p-4 space-y-4 overflow-y-auto">
					{mutation.isError && (
						<div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
							{mutation.error.message || "Something went wrong"}
						</div>
					)}

					{mutation.isSuccess && (
						<div className="text-green-600 text-sm bg-green-50 border border-green-200 px-3 py-2 rounded">
							Contest created successfully!
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Contest Name
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
							placeholder="Enter contest name"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Conducted By
						</label>
						<input
							type="text"
							value={conductedBy}
							onChange={(e) => setConductedBy(e.target.value)}
							className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
							placeholder="e.g. IDCC"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Number of Coding Problems
						</label>
						<input
							type="number"
							value={numberOfProblems}
							onChange={(e) => setNumberOfProblems(e.target.value)}
							className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
							placeholder="e.g. 5"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Duration (in minutes)
						</label>
						<input
							type="number"
							value={durationMinutes}
							onChange={(e) => setDurationMinutes(e.target.value)}
							className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
							placeholder="e.g. 120"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Team Size
						</label>
						<CustomSelect
							options={TeamSizeOptions}
							value={teamSize}
							onChange={setTeamSize}
							placeholder="Select contest type"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Upload Banner Image
						</label>
						<div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg px-6 py-2 cursor-pointer hover:border-black transition">
							<input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
								id="fileUpload"
							/>
							<label
								htmlFor="fileUpload"
								className="flex flex-col items-center cursor-pointer"
							>
								{file ? (
									<>
										<img
											src={URL.createObjectURL(file)}
											alt="Preview"
											className="w-32 h-20 object-contain rounded mb-2"
										/>
										<span className="text-sm text-gray-600">{file.name}</span>
									</>
								) : (
									<>
										<div className="text-gray-500 text-sm">
											Drag & drop or click to upload
										</div>
										<div className="mt-1 text-xs text-gray-400">
											PNG, JPG up to 2MB
										</div>
									</>
								)}
							</label>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-2 px-4 py-2 border-t bg-gray-50">
					<button
						onClick={() => close(false)}
						className="px-4 py-2 text-gray-600 hover:text-gray-900"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={mutation.isPending}
						className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50"
					>
						{mutation.isPending ? "Saving..." : "Save"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ContestModal;
