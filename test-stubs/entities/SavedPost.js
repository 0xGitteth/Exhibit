/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export const SavedPost = {
        filter: async (_q) => [{ id: 'save1', user_email: 'stub@exhibit.local', post_id: 'post1' }],
        create: async (data) => ({ id: 'save-new', ...data }),
        delete: async (id) => ({ id, deleted: true })
};
