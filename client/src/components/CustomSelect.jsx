import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const CustomSelect = ({
	options,
	value,
	onChange,
	placeholder = "Select an option",
	disabled = false,
	error = false,
	label = "",
	loading = false, // new prop
}) => {
	const [open, setOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const selectRef = useRef(null);
	const listRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (selectRef.current && !selectRef.current.contains(e.target)) {
				setOpen(false);
			}
		};

		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [open]);

	const handleKeyDown = (e) => {
		if (disabled) return;

		switch (e.key) {
			case "Enter":
			case " ":
				e.preventDefault();
				if (open && focusedIndex >= 0) {
					handleSelect(options[focusedIndex]);
				} else {
					setOpen(!open);
				}
				break;
			case "Escape":
				e.preventDefault();
				setOpen(false);
				break;
			case "ArrowDown":
				e.preventDefault();
				if (!open) {
					setOpen(true);
					setFocusedIndex(0);
				} else {
					setFocusedIndex((prev) =>
						prev < options.length - 1 ? prev + 1 : prev
					);
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				if (open) {
					setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
				}
				break;
		}
	};

	useEffect(() => {
		if (open && focusedIndex >= 0 && listRef.current) {
			const focusedItem = listRef.current.children[focusedIndex];
			if (focusedItem) {
				focusedItem.scrollIntoView({ block: "nearest" });
			}
		}
	}, [focusedIndex, open]);

	const handleSelect = (option) => {
		onChange(option);
		setOpen(false);
		setFocusedIndex(-1);
	};

	const selectedOption = options.find((opt) => opt.value === value?.value);

	return (
		<div className="w-full" ref={selectRef}>
			{label && (
				<label className="mb-2 block text-sm font-medium text-gray-700">
					{label}
				</label>
			)}
			<div className="relative">
				<button
					type="button"
					onClick={() => !disabled && setOpen(!open)}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-labelledby={label ? undefined : "select-button"}
					className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
						error
							? "border-red-500 bg-red-50"
							: disabled
							? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
							: "border-gray-300 bg-white hover:border-gray-400"
					}`}
				>
					<span
						className={
							selectedOption
								? "font-medium text-gray-900"
								: "text-gray-500"
						}
					>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<ChevronDown
						className={`ml-2 h-5 w-5 transition-transform duration-200 ${
							open ? "rotate-180 transform" : ""
						} ${disabled ? "text-gray-300" : "text-gray-400"}`}
					/>
				</button>

				{open && !disabled && (
					<ul
						ref={listRef}
						role="listbox"
						className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
					>
						{loading ? (
							<li className="flex justify-center py-4">
								<div className="h-5 w-5 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
							</li>
						) : options.length === 0 ? (
							<li className="px-4 py-3 text-center text-sm text-gray-500">
								No options available
							</li>
						) : (
							options.map((option, idx) => {
								const isSelected = option.value === value?.value;
								const isFocused = idx === focusedIndex;

								return (
									<li
										key={option.value}
										role="option"
										aria-selected={isSelected}
										onClick={() => handleSelect(option)}
										onMouseEnter={() => setFocusedIndex(idx)}
										className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors ${
											isFocused
												? "bg-blue-50 text-blue-900"
												: isSelected
												? "bg-gray-50 text-gray-900"
												: "text-gray-700 hover:bg-gray-100"
										}`}
									>
										<span className={isSelected ? "font-medium" : ""}>
											{option.label}
										</span>
										{isSelected && (
											<Check className="h-4 w-4 text-blue-600" />
										)}
									</li>
								);
							})
						)}
					</ul>
				)}
			</div>
		</div>
	);
};

export default CustomSelect;
