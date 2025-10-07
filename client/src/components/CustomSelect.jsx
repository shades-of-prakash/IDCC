import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
const CustomSelect = ({
	options,
	value,
	onChange,
	placeholder = "Select an option",
}) => {
	const [open, setOpen] = useState(false);

	const handleSelect = (option) => {
		onChange(option);
		setOpen(false);
	};

	return (
		<div className="relative w-full">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2 text-left text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
			>
				<span className={value ? "text-black" : "text-gray-400"}>
					{value ? value.label : placeholder}
				</span>
				{open ? (
					<ChevronUp className="h-5 w-5 text-gray-400" />
				) : (
					<ChevronDown className="h-5 w-5 text-gray-400" />
				)}
			</button>

			{open && (
				<ul className="overflow-hidden  absolute z-10 mt-2 w-full rounded border border-gray-400 bg-white shadow-lg">
					{options.map((option) => (
						<li
							key={option.value}
							onClick={() => handleSelect(option)}
							className=" cursor-pointer px-4 py-2 text-black hover:bg-gray-200"
						>
							{option.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default CustomSelect;
