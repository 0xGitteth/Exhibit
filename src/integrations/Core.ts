import { uploadFile } from '@/utils/api';

export const UploadFile = async ({ file }: { file: File }) => {
  return uploadFile(file);
};

export const InvokeLLM = async () => {
  // Placeholder that always approves content
  return { is_appropriate: true, reason: '', suggested_warnings: [] };
};
