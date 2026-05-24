export const getCommentPreview = (text: string, maxLength: number = 120): string => {
    if (!text) return '';

    let cleanText = text;

    cleanText = cleanText.replace(/\$\$[\s\S]*?\$\$/g, '');
    cleanText = cleanText.replace(/\$[^\$]+\$/g, '');

    cleanText = cleanText.replace(/^#+\s+/gm, '');

    cleanText = cleanText.replace(/(\*\*|__|\*|_|~~)/g, '');

    cleanText = cleanText.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
    cleanText = cleanText.replace(/`([^`]+)`/g, '$1');

    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    if (cleanText.length > maxLength) {
        return cleanText.slice(0, maxLength) + '...';
    }

    return cleanText;
    };