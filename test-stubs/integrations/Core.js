/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export const UploadFile = async ({ file }) => {
  // return a fake file_url for build/runtime in test environment
  return { file_url: "/static/stub-image.jpg" };
};

export const InvokeLLM = async (opts) => {
  // Minimal stubbed response: consider content appropriate
  return { is_appropriate: true, reason: "", suggested_warnings: [] };
};
