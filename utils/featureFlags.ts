const getEnvValue = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key] !== undefined) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key] !== undefined) {
    return process.env[key];
  }
  return undefined;
};

export const DUMMY_DATA_ENABLED = (getEnvValue('VITE_ENABLE_DUMMY_DATA') || '').toString().toLowerCase() === 'true';
