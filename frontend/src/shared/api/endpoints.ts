export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me',
    },
    PROJECTS: {
        ROOT: '/projects',
        BY_ID: (project_id: number) => `/projects/${project_id}`,
        MY: '/projects/my_projects',
        MEMBERS: (project_id: number) => `/projects/${project_id}/members`,
        LEAVE: (project_id: number) => `/projects/${project_id}/members/leave`,
        MEMBER_BY_ID: (project_id: number, user_id: number) => `/projects/${project_id}/members/${user_id}`,
    },
    TASKS: {
        LIST: (project_id: number) => `/projects/${project_id}/tasks`,
        BY_ID: (project_id: number, task_id: number) => `/projects/${project_id}/tasks/${task_id}`,
        COMMENTS: (project_id: number, task_id: number) => `/projects/${project_id}/tasks/${task_id}/comments`,
    },
    REVIEWERS: {
        ROOT: (project_id: number) => `/projects/${project_id}/reviewers`,
        ADD: (project_id: number) => `/projects/${project_id}/reviewers/add`,
        COMMENTS: (project_id: number, reviewer_id: number) => `/projects/${project_id}/reviewers/${reviewer_id}/comments`,
    },
    LOGS: '/logs/'
};