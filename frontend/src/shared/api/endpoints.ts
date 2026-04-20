export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        SEARCH: (query: string) => `/auth/users/search?q=${query}`,
    },
    PROJECTS: {
        ROOT: '/projects',
        CREATE: '/projects/create_project',
        BY_ID: (project_id: number) => `/projects/${project_id}`,
        MY: '/projects/my_projects',
        MEMBERS: (project_id: number) => `/projects/${project_id}/members`,
        ADD: (project_id: number) => `/projects/${project_id}/members/add`,
        LEAVE: (project_id: number) => `/projects/${project_id}/members/leave`,
        MEMBER_BY_ID: (project_id: number, user_id: number) => `/projects/${project_id}/members/${user_id}`,
    },
    TASKS: {
        LIST: (project_id: number) => `/projects/${project_id}/tasks`,
        BY_ID: (project_id: number, task_id: number) => `/projects/${project_id}/tasks/${task_id}`,
        CHAT: (project_id: number, task_id: number) => `/projects/${project_id}/tasks/${task_id}/chat`,
        ATTACHMENTS: (project_id: number, task_id: number) => `/projects/${project_id}/tasks/${task_id}/attachments`,
        ATTACHMENT_PREVIEW: (project_id: number, task_id: number, attachment_id: number) => `/projects/${project_id}/tasks/${task_id}/attachments/${attachment_id}/preview`,
        ATTACHMENT_DOWNLOAD: (project_id: number, task_id: number, attachment_id: number) => `/projects/${project_id}/tasks/${task_id}/attachments/${attachment_id}/download`,
    },
    REVIEWERS: {
        LIST: (project_id: number) => `/projects/${project_id}/reviewers`,
        ADD: (project_id: number) => `/projects/${project_id}/reviewers/add`,
        COMMENTS: (project_id: number, reviewer_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments`,
        BY_ID: (project_id: number, reviewer_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}`,
    },
    LOGS: '/logs'
};