export const safeVal = (val, fallback = 0) =>
  typeof val === 'number' && Number.isFinite(val) ? val : fallback;

export const generateId = (prefix) =>
  `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
