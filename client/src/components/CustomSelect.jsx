import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const isGroup = (item) => item && Array.isArray(item.options);

const flattenOptions = (options) => {
    const list = [];
    options.forEach((item) => {
        if (isGroup(item)) {
            item.options.forEach((opt) =>
                list.push({ ...opt, __group: item.label }),
            );
        } else {
            list.push(item);
        }
    });
    return list;
};

const CustomSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    disabled = false,
    error = false,
    loading = false,
    className = "",
    padding = "px-3 py-2",
}) => {
    const [open, setOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const selectRef = useRef(null);
    const listRef = useRef(null);

    const flatOptions = flattenOptions(options);
    const selectedOption = flatOptions.find(
        (opt) => opt.value === value?.value,
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [open]);

    const handleKeyDown = (e) => {
        if (disabled) return;
        switch (e.key) {
            case "Enter":
            case " ":
                e.preventDefault();
                if (open && focusedIndex >= 0)
                    handleSelect(flatOptions[focusedIndex]);
                else setOpen(!open);
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
                        prev < flatOptions.length - 1 ? prev + 1 : prev,
                    );
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (open)
                    setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
        }
    };

    const handleSelect = (option) => {
        onChange(option);
        setOpen(false);
        setFocusedIndex(-1);
    };

    return (
        <div className="w-full h-full relative" ref={selectRef}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`
                  ${className}
                  flex h-full w-full items-center justify-between
                  rounded-md
                  border border-gray-300
                  text-left
                  shadow-sm
                  outline-none
                  transition-colors duration-200
                  ${padding}
                  ${
                      error
                          ? "border-red-500 bg-red-50 ring-2 ring-red-400"
                          : disabled
                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                            : open
                              ? "border-gray-300 ring-2 ring-black"
                              : "hover:ring-2 hover:ring-black focus:ring-2 focus:ring-black"
                  }
                `}
            >
                <span
                    className={`truncate ${
                        selectedOption
                            ? "font-medium text-sm  text-gray-900"
                            : "text-gray-500"
                    }`}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                        open ? "rotate-180 transform" : ""
                    } ${disabled ? "text-gray-300" : "text-gray-400"}`}
                />
            </button>

            {open && !disabled && (
                <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                    <ul
                        ref={listRef}
                        role="listbox"
                        className="overflow-y-auto max-h-40 min-h-0 focus:outline-none"
                    >
                        {loading ? (
                            <li className="flex justify-center py-4">
                                <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
                            </li>
                        ) : flatOptions.length === 0 ? (
                            <li className="px-4 py-3 text-center text-sm text-gray-500">
                                No options available
                            </li>
                        ) : (
                            options.map((item, ind) =>
                                isGroup(item) ? (
                                    <div key={item.label}>
                                        <div
                                            className={`px-4 py-2 text-xs font-semibold text-black  ${ind == 0 ? "border-b" : "border-y"} border-gray-300 bg-gray-50`}
                                        >
                                            {item.label}
                                        </div>
                                        {item.options.map((option) => {
                                            const idx = flatOptions.findIndex(
                                                (o) => o.value === option.value,
                                            );
                                            const isSelected =
                                                option.value === value?.value;
                                            const isFocused =
                                                idx === focusedIndex;
                                            return (
                                                <li
                                                    key={option.value}
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    onClick={() =>
                                                        handleSelect(option)
                                                    }
                                                    onMouseEnter={() =>
                                                        setFocusedIndex(idx)
                                                    }
                                                    className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors ${
                                                        isFocused
                                                            ? "bg-black text-white"
                                                            : isSelected
                                                              ? "bg-gray-100 text-black"
                                                              : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    <span
                                                        className={
                                                            isSelected
                                                                ? "font-medium"
                                                                : ""
                                                        }
                                                    >
                                                        {option.label}
                                                    </span>
                                                    {isSelected && (
                                                        <Check className="h-4 w-4 text-black" />
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    (() => {
                                        const idx = flatOptions.findIndex(
                                            (o) => o.value === item.value,
                                        );
                                        const isSelected =
                                            item.value === value?.value;
                                        const isFocused = idx === focusedIndex;
                                        return (
                                            <li
                                                key={item.value}
                                                role="option"
                                                aria-selected={isSelected}
                                                onClick={() =>
                                                    handleSelect(item)
                                                }
                                                onMouseEnter={() =>
                                                    setFocusedIndex(idx)
                                                }
                                                className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors ${
                                                    isFocused
                                                        ? "bg-black text-white"
                                                        : isSelected
                                                          ? "bg-gray-100 text-black"
                                                          : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                <span
                                                    className={
                                                        isSelected
                                                            ? "font-medium"
                                                            : ""
                                                    }
                                                >
                                                    {item.label}
                                                </span>
                                                {isSelected && (
                                                    <Check className="h-4 w-4 text-black" />
                                                )}
                                            </li>
                                        );
                                    })()
                                ),
                            )
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
