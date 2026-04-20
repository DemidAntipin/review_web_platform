const STANDALONE_ENVS = ['equation', 'align', 'gather', 'multline', 'flalign', 'alignat', 'math', 'displaymath'];

const RE_YAML = /^---[\s\S]*?---\s*/;
const RE_BLOCK_MATH = /\$\$([\s\S]+?)\$\$/g;
const RE_INLINE_MATH = /\$([\s\S]+?)\$/g;
const RE_ENV = /\\begin\{([a-z]*\*?)\}([\s\S]+?)\\end\{\1\}/gm;

export const wrapCyrillicInMath = (text: string): string => {
    if (!text) return '';
    const cyrillicRegex = /(\\text\{[^}]*\})|([а-яА-ЯёЁ][а-яА-ЯёЁ\s]*)/gm;

    return text.replace(cyrillicRegex, (match, alreadyWrapped, toWrap) => {
        if (alreadyWrapped) return alreadyWrapped;
        if (toWrap) return `\\text{${toWrap.trimEnd()}}`;
        return match;
    });
};

const normalizeEnvForKatex = (latex: string): string => {
    return latex
        .replace(/\\begin\{(equation|align|multline|flalign|alignat)\*?\}/g, '\\begin{aligned}')
        .replace(/\\end\{(equation|align|multline|flalign|alignat)\*?\}/g, '\\end{aligned}')
        .replace(/\\begin\{gather\*?\}/g, '\\begin{gathered}')
        .replace(/\\end\{gather\*?\}/g, '\\end{gathered}');
};

const formatErrorMath = (latex: string, options: { showDollars?: boolean } = {}): string => {
    const normalized = normalizeEnvForKatex(latex.trim());
    const processed = wrapCyrillicInMath(normalized);
    const dollars = options.showDollars ? '\\text{\\color{red}{\\$\\$ }}' : '';
    
    return `$$\\color{red}{${dollars}${processed}${dollars}}$$`;
};

export const prepareMarkdownForPreview = (content: string): string => {
    if (!content) return '';

    let result = content.replace(RE_YAML, '');
    const mathStore: string[] = [];

    result = result.replace(RE_BLOCK_MATH, (_, inner) => {
        const isInvalid = STANDALONE_ENVS.some(env => inner.includes(`\\begin{${env}}`));
        const block = isInvalid 
            ? formatErrorMath(inner, { showDollars: true })
            : wrapCyrillicInMath(`$$${inner}$$`);
        
        mathStore.push(block);
        return `__MATH_BLOCK_${mathStore.length - 1}__`;
    });

    result = result.replace(RE_INLINE_MATH, (match) => {
        mathStore.push(wrapCyrillicInMath(match));
        return `__MATH_BLOCK_${mathStore.length - 1}__`;
    });

    result = result.replace(RE_ENV, (match, envName) => {
        const isStandalone = STANDALONE_ENVS.includes(envName.replace('*', ''));
        const block = isStandalone 
            ? `\n$$\n${wrapCyrillicInMath(normalizeEnvForKatex(match))}\n$$\n` 
            : `\n${formatErrorMath(match)}\n`;
        
        return block;
    });

    return result.replace(/__MATH_BLOCK_(\d+)__/g, (_, id) => mathStore[Number(id)]).trim();
};