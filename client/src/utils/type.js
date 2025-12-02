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

  const validatePrimitive = (val) => {
    if (innerType === "string") return typeof val === "string";
    if (innerType === "char") return typeof val === "string" && val.length <= 1;
    if (innerType === "number") return typeof val === "number";
    if (innerType === "boolean") return typeof val === "boolean";
    return true;
  };

  const validateArray = (val, currentDepth) => {
    if (!Array.isArray(val)) return false;

    if (currentDepth === depth) {
      return val.every((v) => validatePrimitive(v));
    }

    return val.every((inner) => validateArray(inner, currentDepth + 1));
  };

  if (depth > 0) return validateArray(value, 1);
  return validatePrimitive(value);
};
