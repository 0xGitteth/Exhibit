/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export const Post = {
        filter: async (_q) => [{ id: 'post1', created_by: 'stub@exhibit.local' }],
        create: async (data) => ({ id: 'post-new', ...data })
};

