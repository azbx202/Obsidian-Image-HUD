import { moment } from 'obsidian';
import en from './en';
import zh from './zh';

const localeMap: { [key: string]: any } = {
    'en': en,
    'zh': zh,
    'zh-cn': zh,
};

let currentLocale = en;
let currentLangCode = 'en';

export function setLocale(lang: string) {
    if (lang === 'auto') {
        // @ts-ignore
        const obsidianLang = moment.locale();
        currentLangCode = obsidianLang;
    } else {
        currentLangCode = lang;
    }

    const lowerLang = currentLangCode.toLowerCase();
    if (localeMap[lowerLang]) {
        currentLocale = localeMap[lowerLang];
    } else if (lowerLang.startsWith('zh')) {
        currentLocale = zh;
    } else {
        currentLocale = en;
    }
}

export function t(key: keyof typeof en, vars?: { [key: string]: string }): string {
    let text = currentLocale[key] || en[key] || key;
    
    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            text = text.replace(`\${${k}}`, v);
        }
    }
    
    return text;
}
