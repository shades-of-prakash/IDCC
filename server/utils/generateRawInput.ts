const generateRawInput = (
    input: Record<string, any>,
    argumentsDef: { name: string; type: string }[],
): string => {
    const lines: string[] = [];

    for (const arg of argumentsDef) {
        const value = input[arg.name];

        // Matrix (number[][], string[][])
        if (Array.isArray(value) && Array.isArray(value[0])) {
            for (const row of value) {
                lines.push(row.join(" "));
            }
            continue;
        }

        // 1D Array
        if (Array.isArray(value)) {
            lines.push(value.join(" "));
            continue;
        }

        // Primitive
        lines.push(String(value));
    }

    return lines.join("\n") + "\n";
};

export default generateRawInput;
