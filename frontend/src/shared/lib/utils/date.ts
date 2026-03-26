export const calculateDeadline = (deadlineStr: string): number => {
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};