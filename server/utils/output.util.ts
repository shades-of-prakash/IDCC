/* =========================================================
   Output Utility – Production-Safe Judge Comparison
========================================================= */

type Canonical = string | number | boolean | null | Canonical[] | Canonical[][];

/* -----------------------------
   Helpers
----------------------------- */

function normalizePythonLiterals(s: string) {
    return s
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false");
}

function parseType(type: string) {
    let depth = 0;
    while (type.startsWith("array<")) {
        depth++;
        type = type.slice(6, -1);
    }
    return { depth, innerType: type };
}

function castPrimitive(val: string, type: string): Canonical {
    const v = val.trim();

    if (type === "number") {
        const n = Number(v);
        return Number.isNaN(n) ? null : n;
    }

    if (type === "boolean") {
        return v.toLowerCase() === "true" || v === "1";
    }

    if (type === "char") {
        return v.length ? v[0] : "";
    }

    return v;
}

/* -----------------------------
   User Output Parser
----------------------------- */

function parseUserOutput(raw: string, outputType: string): Canonical {
    const cleaned = raw.trim();
    const { depth, innerType } = parseType(outputType);

    // ===== EMPTY OUTPUT =====
    if (!cleaned) {
        if (depth > 0) return [];
        return "";
    }

    let text = normalizePythonLiterals(cleaned);

    // Strip wrapping [] for C/C++ like "[1 2 3]"
    if (!text.startsWith("[") && text.startsWith("[") && text.endsWith("]")) {
        text = text.slice(1, -1);
    }

    const isJsonLike = text.startsWith("[");

    /* ===== PRIMITIVE ===== */
    if (depth === 0) {
        return castPrimitive(text, innerType);
    }

    /* ===== 1D ARRAY ===== */
    if (depth === 1) {
        if (isJsonLike) {
            try {
                const arr = JSON.parse(text.replace(/'/g, '"'));
                if (Array.isArray(arr)) {
                    return arr.map((v) => castPrimitive(String(v), innerType));
                }
            } catch {}
        }

        return text
            .split(/[\s,]+/)
            .filter(Boolean)
            .map((v) => castPrimitive(v, innerType));
    }

    /* ===== 2D ARRAY ===== */
    if (depth === 2) {
        if (isJsonLike) {
            try {
                const mat = JSON.parse(text.replace(/'/g, '"'));
                if (Array.isArray(mat)) {
                    return mat.map((row) =>
                        Array.isArray(row)
                            ? row.map((v) =>
                                  castPrimitive(String(v), innerType),
                              )
                            : [],
                    );
                }
            } catch {}
        }

        return text
            .split(/\n+/)
            .filter((l) => l.trim())
            .map((line) =>
                line
                    .trim()
                    .split(/[\s,]+/)
                    .filter(Boolean)
                    .map((v) => castPrimitive(v, innerType)),
            );
    }

    throw new Error(`Unsupported outputType: ${outputType}`);
}

/* -----------------------------
   Comparison Logic
----------------------------- */

function deepEqual(a: Canonical, b: Canonical, floatTolerance = 1e-6): boolean {
    if (typeof a !== typeof b) return false;

    if (typeof a === "number" && typeof b === "number") {
        return Math.abs(a - b) <= floatTolerance;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((v, i) => deepEqual(v, b[i], floatTolerance));
    }

    return a === b;
}

export function outputsMatch(
    userRaw: string,
    expected: Canonical,
    outputType: string,
): boolean {
    try {
        const parsedUser = parseUserOutput(userRaw, outputType);
        return deepEqual(parsedUser, expected);
    } catch (e) {
        console.error("Output comparison error:", e);
        return false;
    }
}

/* -----------------------------
   Display Helpers
----------------------------- */

export function canonicalToDisplayString(val: Canonical): string {
    if (val == null) return "";

    if (
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean"
    ) {
        return String(val);
    }

    return JSON.stringify(val);
}

export function userOutputToDisplayString(
    raw: string,
    outputType: string,
): string {
    try {
        const parsed = parseUserOutput(raw, outputType);
        return canonicalToDisplayString(parsed);
    } catch {
        return raw;
    }
}
