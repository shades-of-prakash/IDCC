export const parseType = (type) => {
    let depth = 0;
    while (type.startsWith("array<")) {
        depth++;
        type = type.slice(6, -1);
    }
    return { depth, innerType: type };
};

export const getDefaultValue = (type) => {
    const { depth, innerType } = parseType(type);
    const buildDefault = (currentDepth) => {
        if (currentDepth === 0) {
            if (innerType === "string") return "";
            if (innerType === "char") return "";
            if (innerType === "number") return 0;
            if (innerType === "boolean") return false;
            return null;
        }
        return [buildDefault(currentDepth - 1)];
    };
    return buildDefault(depth);
};

export const validateValueAgainstType = (value, type) => {
    const { depth, innerType } = parseType(type);

    // ✅ null is always allowed
    if (value === null) return true;

    const validatePrimitive = (val) => {
        if (val === null) return true; // ✅ allow null leaf

        // ✅ STRICT type checking - no type coercion
        if (innerType === "string") {
            return typeof val === "string";
        }
        if (innerType === "char") {
            return typeof val === "string" && val.length <= 1;
        }
        if (innerType === "number") {
            return typeof val === "number" && !isNaN(val);
        }
        if (innerType === "boolean") {
            return typeof val === "boolean";
        }
        return false; // ✅ Changed from 'return true' to 'return false' for unknown types
    };

    const validateArray = (val, currentDepth) => {
        if (val === null) return true; // ✅ allow null at any level
        if (!Array.isArray(val)) return false;

        if (currentDepth === depth) {
            // ✅ At the innermost array level - every element must pass validatePrimitive
            return val.every((element) => validatePrimitive(element));
        }

        // We need to go deeper
        return val.every((inner) => validateArray(inner, currentDepth + 1));
    };

    if (depth > 0) {
        return validateArray(value, 1);
    }

    return validatePrimitive(value);
};

// ============================================================================
// TEST CASES (for verification)
// ============================================================================

// Test array<string>
console.log("Testing array<string>:");
console.log(validateValueAgainstType(["a", "b", "c"], "array<string>")); // true
console.log(validateValueAgainstType([0, 9, 9, "9"], "array<string>")); // false ✅
console.log(validateValueAgainstType([""], "array<string>")); // true
console.log(validateValueAgainstType([], "array<string>")); // true

// Test array<number>
console.log("\nTesting array<number>:");
console.log(validateValueAgainstType([1, 2, 3], "array<number>")); // true
console.log(validateValueAgainstType([1, "2", 3], "array<number>")); // false ✅
console.log(validateValueAgainstType([0], "array<number>")); // true

// Test string
console.log("\nTesting string:");
console.log(validateValueAgainstType("hello", "string")); // true
console.log(validateValueAgainstType(123, "string")); // false ✅

// Test number
console.log("\nTesting number:");
console.log(validateValueAgainstType(123, "number")); // true
console.log(validateValueAgainstType("123", "number")); // false ✅

// Test array<array<number>>
console.log("\nTesting array<array<number>>:");
console.log(
    validateValueAgainstType(
        [
            [1, 2],
            [3, 4],
        ],
        "array<array<number>>",
    ),
); // true
console.log(
    validateValueAgainstType(
        [
            [1, "2"],
            [3, 4],
        ],
        "array<array<number>>",
    ),
); // false ✅
