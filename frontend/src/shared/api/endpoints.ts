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
        COMMENTS: (() => {
            const base = (project_id: number, reviewer_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments`;
            base.DECOMPOSE = (project_id: number, reviewer_id: number, comment_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments/${comment_id}/decompose`;
            base.ADD = (project_id: number, reviewer_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments/add`;
            base.BY_ID = (project_id: number, reviewer_id: number, comment_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments/${comment_id}`;

            return base;
        })(),
        BY_ID: (project_id: number, reviewer_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}`,
    },
    RESPONSES: (() => {
       const base = (project_id: number, reviewer_id: number, comment_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments/${comment_id}/responses/`;
       base.BY_ID = (project_id: number, reviewer_id: number, comment_id: number, response_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments/${comment_id}/responses/${response_id}`;
       base.EXPORT = (project_id: number, reviewer_id: number, comment_id: number, response_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments/${comment_id}/responses/${response_id}/export`;

       return base
    })(),
    LOGS: '/logs/'
};