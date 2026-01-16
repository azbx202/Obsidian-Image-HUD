import { App, TFile, Notice, Editor } from 'obsidian';
import { t } from './lang/helpers';
import * as crypto from 'crypto';

export interface ProcessOptions {
    targetFormat: 'png' | 'webp' | 'jpeg';
    quality: number; // 0-1 范围
    resizeMode: 'scale' | 'fixed_width' | 'none';
    resizeValue: number; // 0.5 代表 50%, 800 代表 800px
    deleteOriginal?: boolean;
    useMD5?: boolean;
}

export class ImageProcessor {
    constructor(private app: App) {}

    async processImage(file: TFile, options: ProcessOptions, editor: Editor, linkStart: number, linkEnd: number, linkSuffix: string = '') {
        new Notice(t('PROC_PROCESSING', { name: file.name }));

        try {
            const blob = await this.generateImageBlob(file, options);
            if (!blob) throw new Error(t('PROC_FAIL_BLOB'));

            const newFileName = await this.generateNewFileName(file, options, blob);
            const newFile = await this.saveNewFile(file.parent.path, newFileName, blob);

            this.updateEditorLink(editor, newFile.path, linkStart, linkEnd, options.deleteOriginal, linkSuffix);
            
            if (options.deleteOriginal) {
                try {
                    await this.app.vault.trash(file, true);
                } catch (err) {
                    console.error('Failed to delete original file', err);
                    new Notice(t('PROC_FAIL_GENERIC') + ': Delete failed');
                }
            }

            new Notice(t('PROC_SUCCESS', { name: newFileName }));
        } catch (error) {
            console.error(error);
            new Notice(t('PROC_FAIL_GENERIC'));
        }
    }

    private async generateImageBlob(file: TFile, options: ProcessOptions): Promise<Blob | null> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(t('PROC_FAIL_CANVAS'));
                    return;
                }

                // 计算新尺寸
                let width = img.naturalWidth;
                let height = img.naturalHeight;

                if (options.resizeMode === 'scale') {
                    width = Math.round(width * options.resizeValue);
                    height = Math.round(height * options.resizeValue);
                } else if (options.resizeMode === 'fixed_width') {
                    const ratio = options.resizeValue / width;
                    width = options.resizeValue;
                    height = Math.round(height * ratio);
                }

                if (width < 1 || height < 1) {
                    reject(t('PROC_FAIL_SIZE_TOO_SMALL'));
                    return;
                }

                canvas.width = width;
                canvas.height = height;

                // 绘制图像
                ctx.drawImage(img, 0, 0, width, height);

                // 转换为 Blob
                const mimeType = `image/${options.targetFormat}`;
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, mimeType, options.quality);
            };
            
            img.onerror = () => reject(t('PROC_FAIL_LOAD'));
            
            // 加载图像数据
            const resourcePath = this.app.vault.getResourcePath(file);
            img.src = resourcePath;
        });
    }

    private async generateNewFileName(file: TFile, options: ProcessOptions, blob: Blob): Promise<string> {
        const baseName = file.basename;
        const ext = options.targetFormat;
        
        if (options.useMD5) {
            const buffer = await blob.arrayBuffer();
            const hash = crypto.createHash('md5').update(Buffer.from(buffer)).digest('hex');
            return `${hash}.${ext}`;
        }

        let suffix = '';
        
        if (options.resizeMode !== 'none') {
             // 根据调整模式添加后缀
             if (options.resizeMode === 'scale') {
                 suffix += `_${Math.round(options.resizeValue * 100)}pct`;
             } else {
                 suffix += `_${options.resizeValue}w`;
             }
        }
        
        if (options.targetFormat === 'jpeg' || options.targetFormat === 'webp') {
             suffix += `_${Math.round(options.quality * 100)}q`;
        }
        
        // 如果没有后缀（例如仅转换），添加格式名称以区分
        if (!suffix && file.extension !== ext) {
            suffix += `_${ext}`;
        } else if (!suffix) {
            suffix += `_processed`;
        }

        return `${baseName}${suffix}.${ext}`;
    }

    private async saveNewFile(folderPath: string, fileName: string, blob: Blob): Promise<TFile> {
        const arrayBuffer = await blob.arrayBuffer();
        const fullPath = `${folderPath}/${fileName}`;
        
        // 检查文件是否存在，避免重名冲突
        let finalPath = fullPath;
        let counter = 1;
        while (await this.app.vault.adapter.exists(finalPath)) {
             const namePart = fileName.substring(0, fileName.lastIndexOf('.'));
             const extPart = fileName.substring(fileName.lastIndexOf('.'));
             finalPath = `${folderPath}/${namePart}_${counter}${extPart}`;
             counter++;
        }

        return await this.app.vault.createBinary(finalPath, arrayBuffer);
    }

    private updateEditorLink(editor: Editor, filePath: string, start: number, end: number, replace: boolean = false, linkSuffix: string = '') {
        // 默认使用 Wiki 链接格式 ![[...]]
        
        const linkText = `![[${filePath}${linkSuffix}]]`;
        
        if (replace) {
            editor.replaceRange(linkText, editor.offsetToPos(start), editor.offsetToPos(end));
        } else {
            editor.replaceRange('\n' + linkText, editor.offsetToPos(end));
        }
    }
}
