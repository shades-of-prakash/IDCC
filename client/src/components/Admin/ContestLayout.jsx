import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ContestNavbar from "./ContestNavbar";
import ContestModal from "./ContestModal";
import { Link } from "react-router";

const Contest = () => {
	const [showModal, setShowModal] = useState(false);
	const toggleModal = () => setShowModal((prev) => !prev);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["contests"],
		queryFn: async () => {
			const res = await fetch("/api/contest/list");
			if (!res.ok) throw new Error("Failed to fetch contests");
			return res.json();
		},
	});

	// ---------- Helper to determine status ----------
	const getStatus = (contest) => {
		if (!contest.questions) return "Incomplete";
		return contest.questions.length === contest.numberOfProblems
			? "Complete"
			: "Incomplete";
	};

	return (
		<div className="w-full h-full">
			<div className="w-full h-16">
				<ContestNavbar toggle={toggleModal} />
			</div>

			{showModal && <ContestModal close={setShowModal} />}

			<div className="w-full h-[calc(100%-4rem)] p-2">
				<div className="bg-white rounded shadow overflow-x-auto border border-gray-300">
					{isLoading && (
						<div className="text-center py-4 text-gray-600">Loading...</div>
					)}

					{isError && (
						<div className="text-center py-4 text-red-600">{error.message}</div>
					)}

					{data?.data?.length > 0 ? (
						<table className="w-full text-sm text-left text-gray-700">
							<thead className="bg-gray-100 text-gray-900">
								<tr>
									<th className="px-4 py-3 font-semibold">Contest Name</th>
									<th className="px-4 py-3 font-semibold">Conducted By</th>
									<th className="px-4 py-3 font-semibold">Problems</th>
									<th className="px-4 py-3 font-semibold">Duration (mins)</th>
									<th className="px-4 py-3 font-semibold">Team Size</th>
									<th className="px-4 py-3 font-semibold">Banner</th>
									<th className="px-4 py-3 font-semibold">Status</th>
									<th className="px-4 py-3 font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody>
								{data.data.map((contest) => (
									<tr key={contest._id} className="border-t">
										<td className="px-4 py-2">{contest.name}</td>
										<td className="px-4 py-2">{contest.conductedBy}</td>
										<td className="px-4 py-2">{contest.numberOfProblems}</td>
										<td className="px-4 py-2">{contest.durationMinutes}</td>
										<td className="px-4 py-2">{contest.teamSize}</td>
										<td className="px-4 py-2">
											{contest.bannerImage ? (
												<img
													src={`${import.meta.env.VITE_BACKEND_URL}${
														contest.bannerImage
													}`}
													alt="banner"
													className="h-10 w-10 object-contain rounded"
												/>
											) : (
												<span className="text-gray-400">No Image</span>
											)}
										</td>
										<td className="px-4 py-2">
											<span
												className={`px-2 py-1 rounded-full  text-xs ${
													getStatus(contest) === "Complete"
														? "bg-green-500"
														: "bg-red-100 text-red-700"
												}`}
												title="All contest questions must be posted for them to appear in the live contest."
											>
												{getStatus(contest)}
											</span>
										</td>
										<td className="px-4 py-2">
											<Link
												to={`edit/${contest._id}`}
												className="text-blue-600 hover:underline"
											>
												Edit
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						!isLoading &&
						!isError && (
							<div className="text-center py-4 text-gray-600">
								No contests found
							</div>
						)
					)}
				</div>
			</div>
		</div>
	);
};

export default Contest;
