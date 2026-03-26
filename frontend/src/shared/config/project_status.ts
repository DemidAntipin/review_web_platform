export const ROLE_MAP: Record<number, string> = {
    1: 'В работе',
    2: 'Завершено',
    3: 'Принято',
    4: 'Закрыто'
};

export type ProjectStatusValue = keyof typeof ROLE_MAP;