const getEnvValue = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key] !== undefined) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key] !== undefined) {
    return process.env[key];
  }
  return undefined;
};

const envDummySetting = getEnvValue('VITE_ENABLE_DUMMY_DATA');
const isDummyFlagSet = (envDummySetting || '').toString().toLowerCase();

export const DUMMY_DATA_ENABLED = envDummySetting === undefined ? false : isDummyFlagSet === 'true';
