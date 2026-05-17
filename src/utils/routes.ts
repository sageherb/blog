export const blogPath = (id: string) => `/blog/${id}/`;
export const projectPath = (id: string) => `/project/${id}/`;
export const tagPath = (tag: string) => `/tags/${encodeURIComponent(tag)}/`;

export const blogOgPath = (id: string) => `/og/${id}.png`;
export const projectOgPath = (id: string) => `/og/project/${id}.png`;
