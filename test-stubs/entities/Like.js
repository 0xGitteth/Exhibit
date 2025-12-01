/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export const Like = {
        filter: async (_q) => [{ id: 'like1', user_email: 'stub@exhibit.local', post_id: 'post1' }],
        create: async (data) => ({ id: 'like-new', ...data }),
        delete: async (id) => ({ id, deleted: true })
};
