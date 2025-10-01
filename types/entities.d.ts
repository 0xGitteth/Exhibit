/* eslint-disable no-unused-vars */
declare module '@/entities/User' {
  export type User = {
    email: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    show_sensitive_content?: boolean;
  };
  export const User: {
    me: () => Promise<User>;
    filter: (_q: any) => Promise<User[]>;
  };
  export default User;
}

declare module '@/entities/Post' {
  export type Post = {
    id: string | number;
    title?: string;
    caption?: string;
    image_url?: string;
    trigger_warnings?: string[];
    photography_style?: string;
    tags?: string[];
    location?: string;
    tagged_people?: any[];
    created_by?: string;
  };
  export const Post: {
    filter: (_q: any) => Promise<Post[]>;
  };
  export default Post;
}

declare module '@/entities/Like' {
  export type Like = { id: string | number; user_email: string; post_id: string | number };
  export const Like: {
    filter: (_q: any) => Promise<Like[]>;
    create: (_data: any) => Promise<any>;
    delete: (_id: string | number) => Promise<any>;
  };
  export default Like;
}

declare module '@/entities/SavedPost' {
  export type SavedPost = { id: string | number; user_email: string; post_id: string | number };
  export const SavedPost: {
    filter: (_q: any) => Promise<SavedPost[]>;
    create: (_data: any) => Promise<any>;
    delete: (_id: string | number) => Promise<any>;
  };
  export default SavedPost;
}
