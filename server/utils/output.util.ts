/* =========================================================
   Output Utility - Parse User Output Only
   Testcase output is already structured, just parse user output
   ========================================================= */

type Canonical = string | number | boolean | null | Canonical[] | Canonical[][];

/* -----------------------------
   Type parser
   ----------------------------- */
function parseType(type: string) {
    let depth = 0;
    while (type.startsWith("array<")) {
        depth++;
        type = type.slice(6, -1);
    }
    return { depth, innerType: type };
}

/* -----------------------------
   Cast primitive
   ----------------------------- */
function cast(val: string, type: string): any {
    const trimmed = val.trim();
    if (type === "number") return Number(trimmed);
    if (type === "boolean") return trimmed === "true";
    if (type === "char") return trimmed;
    return trimmed;
}

/* -----------------------------
   Parse User Output to Match outputType Structure
   Handles Python [1,2,3] and C/C++/Java "1 2 3" formats
   ----------------------------- */
function parseUserOutput(rawOutput: string, outputType: string): Canonical {
    const cleaned = rawOutput.trim();

    if (cleaned === "") {
        const { depth } = parseType(outputType);
        if (depth === 1) return [];
        if (depth === 2) return [];
        return "";
    }

    const { depth, innerType } = parseType(outputType);

    // Check if output looks like Python-style JSON
    const isPythonStyle = cleaned.startsWith("[");

    // ===== PRIMITIVE (depth 0) =====
    if (depth === 0) {
        return cast(cleaned, innerType);
    }

    // ===== 1D ARRAY (depth 1) =====
    if (depth === 1) {
        if (isPythonStyle) {
            try {
                // Python: [1,2,3] or ['a','b','c']
                const parsed = JSON.parse(cleaned.replace(/'/g, '"'));
                if (Array.isArray(parsed)) {
                    return parsed.map((v) => cast(String(v), innerType));
                }
            } catch (e) {
                // Fall through to whitespace split
            }
        }
        // C/C++/Java: "1 2 3" or "a b c"
        return cleaned
            .split(/[\s\n]+/)
            .filter((v) => v)
            .map((v) => cast(v, innerType));
    }

    // ===== 2D ARRAY (depth 2) =====
    if (depth === 2) {
        if (isPythonStyle) {
            try {
                // Python: [[1,2],[3,4]] or [['a','b'],['c','d']]
                const parsed = JSON.parse(cleaned.replace(/'/g, '"'));
                if (Array.isArray(parsed)) {
                    return parsed.map((row) => {
                        if (!Array.isArray(row)) return [];
                        return row.map((v) => cast(String(v), innerType));
                    });
                }
            } catch (e) {
                // Fall through to line-based split
            }
        }
        // C/C++/Java: "1 2\n3 4" or "a b\nc d"
        return cleaned
            .split("\n")
            .filter((line) => line.trim())
            .map((line) =>
                line
                    .trim()
                    .split(/\s+/)
                    .filter((v) => v)
                    .map((v) => cast(v, innerType)),
            );
    }

    throw new Error(`Unsupported outputType: ${outputType}`);
}

/* -----------------------------
   Compare User Output with Testcase Output
   Testcase output is already structured correctly
   ----------------------------- */
export function outputsMatch(
    userRaw: string,
    testcaseOutput: Canonical,
    outputType: string,
): boolean {
    try {
        const parsedUser = parseUserOutput(userRaw, outputType);
        return JSON.stringify(parsedUser) === JSON.stringify(testcaseOutput);
    } catch (e) {
        console.error("Error comparing outputs:", e);
        return false;
    }
}

/* =========================================================
   DISPLAY HELPERS - Return Clean String for UI
   Primitives show without quotes, arrays/objects as JSON
   ========================================================= */

export function canonicalToDisplayString(canonical: Canonical): string {
    if (canonical == null) return "";

    // For primitives (string, number, boolean), return as-is without JSON.stringify
    if (
        typeof canonical === "string" ||
        typeof canonical === "number" ||
        typeof canonical === "boolean"
    ) {
        return String(canonical);
    }

    // For arrays and objects, use JSON.stringify
    return JSON.stringify(canonical);
}

export function userOutputToDisplayString(
    rawOutput: string,
    outputType: string,
): string {
    try {
        const parsed = parseUserOutput(rawOutput, outputType);

        // Return primitive values without quotes
        if (
            typeof parsed === "string" ||
            typeof parsed === "number" ||
            typeof parsed === "boolean"
        ) {
            return String(parsed);
        }

        // Return arrays/objects as JSON
        return JSON.stringify(parsed);
    } catch (e) {
        // If parsing fails, return raw output as-is
        return rawOutput;
    }
}

/* -----------------------------
   LEGACY: Keep for backward compatibility
   ----------------------------- */
export function normalizeExpectedOutput(
    expected: any,
    outputType: string,
): Canonical {
    // Testcase output is already structured, just return as-is
    return expected;
}

export function expectedToDisplayString(expected: Canonical): string {
    if (expected == null) return "";

    // For primitives, return without quotes
    if (
        typeof expected === "string" ||
        typeof expected === "number" ||
        typeof expected === "boolean"
    ) {
        return String(expected);
    }

    // For arrays/objects, return as JSON
    return JSON.stringify(expected);
}
