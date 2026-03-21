export const ROLE_MAP: Record<number, string> = {
    1: 'Автор',
    2: 'Соавтор',
    3: 'Редактор',
    4: 'Админ'
};

export type UserRoleValue = keyof typeof ROLE_MAP;