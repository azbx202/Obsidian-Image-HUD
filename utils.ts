import { App, TFile } from 'obsidian';

/**
 * 将字节数格式化为人类可读的字符串
 */
export function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 从链接文本解析 TFile
 */
export function getImageFile(app: App, linkText: string, sourcePath: string): TFile | null {
    // 移除任何参数，例如 |100 或 #anchor
    let cleanLink = linkText.split('|')[0];
    cleanLink = cleanLink.split('#')[0];
    
    const file = app.metadataCache.getFirstLinkpathDest(cleanLink, sourcePath);
    
    if (file instanceof TFile && isImageFile(file)) {
        return file;
    }
    return null;
}

/**
 * 检查文件是否为图片
 */
export function isImageFile(file: TFile): boolean {
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
    return extensions.includes(file.extension.toLowerCase());
}

/**
 * 使用 HTML Image 元素获取图片尺寸
 */
export async function getImageDimensions(app: App, file: TFile): Promise<{ width: number, height: number } | null> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = app.vault.getResourcePath(file);
        
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        
        img.onerror = () => {
            resolve(null);
        };
        
        img.src = url;
    });
}
