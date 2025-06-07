export function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  // Consider a more robust deep copy for complex objects if needed,
  // especially if they contain Dates, RegExps, or custom class instances.
  // For typical JSON-like structures, this is usually sufficient.
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error("Deep copy failed for object:", obj, e);
    // Fallback or rethrow, depending on desired error handling
    // For simplicity here, returning the original object on error, which is not a true deep copy.
    // A more robust solution might throw the error or use a library.
    return obj; 
  }
} 