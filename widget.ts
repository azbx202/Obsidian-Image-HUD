import { WidgetType, EditorView } from '@codemirror/view';
import { App, TFile, Menu, Editor, setIcon, Notice, FileSystemAdapter } from 'obsidian';
import { spawn } from 'child_process';
import { formatBytes, getImageDimensions } from './utils';
import { ImageProcessor } from './processor';
import { AdvancedExportModal } from './modal';
import { t } from './lang/helpers';
import ImageHUDPlugin from './main';

export class ImageInfoWidget extends WidgetType {
    private dom: HTMLElement;

    constructor(
        private app: App,
        private file: TFile,
        private linkStart: number,
        private linkEnd: number, // 插入新链接的位置（创建时固定）
        private hudId: string, // 悬停联动的唯一 ID
        private linkSuffix: string = '' // 原始链接参数，如 |100 或 #bg
    ) {
        super();
    }

    toDOM(view: EditorView): HTMLElement {
        const container = document.createElement('div');
        container.addClass('image-hud-container');
        container.setAttribute('data-hud-id', this.hudId); // 链接 ID
        this.dom = container;

        // @ts-ignore
        const plugin = this.app.plugins.getPlugin('obsidian-image-hud') as ImageHUDPlugin;
        // 如果设置缺失，默认值为 true
        const s = plugin?.settings || {
            showFileSize: true, showFileType: true, showDimensions: true,
            showBtnPreview: true, showBtnSysEdit: true, showBtnConvert: true, showBtnDelete: true
        };

        // 0. 信息文本
        let infoText: HTMLElement | null = null;
        if (s.showFileSize || s.showFileType || s.showDimensions) {
            infoText = container.createSpan({ cls: 'image-hud-text' });
            infoText.setText(t('HUD_LOADING'));
        }

        // 1. 预览按钮
        let btnPreview: HTMLElement | null = null;
        if (s.showBtnPreview) {
            btnPreview = container.createDiv({ cls: 'image-hud-btn' });
            setIcon(btnPreview, 'eye');
            btnPreview.setAttribute('aria-label', t('HUD_BTN_PREVIEW'));
            
            // 悬停预览逻辑
            btnPreview.addEventListener('mouseenter', (e) => this.showPreview(e, btnPreview!));
            btnPreview.addEventListener('mouseleave', () => this.hidePreview());
        }

        // 加载元数据以更新文本和工具提示
        this.loadMetadata(infoText, btnPreview, s);

        // 2. 系统编辑按钮 (铅笔)
        if (s.showBtnSysEdit) {
            const btnSysEdit = container.createDiv({ cls: 'image-hud-btn' });
            setIcon(btnSysEdit, 'pencil');
            btnSysEdit.setAttribute('aria-label', t('HUD_BTN_SYSTEM_EDIT'));
            btnSysEdit.addEventListener('click', (e) => {
                e.preventDefault();
                
                // @ts-ignore
                const plugin = this.app.plugins.getPlugin('obsidian-image-hud') as ImageHUDPlugin;
                const editorPath = plugin?.settings?.editorAppPath;

                if (editorPath && editorPath.trim() !== '') {
                    if (this.app.vault.adapter instanceof FileSystemAdapter) {
                        const imagePath = this.app.vault.adapter.getFullPath(this.file.path);
                        
                        try {
                            const child = spawn(editorPath, [imagePath], {
                                detached: true,
                                stdio: 'ignore'
                            });
                            child.unref();
                        } catch (err) {
                            new Notice(`Failed to open editor: ${err.message}`);
                        }
                    } else {
                        new Notice('Custom editor not supported on this platform.');
                    }
                } else {
                    this.app.openWithDefaultApp(this.file.path);
                }
            });
        }

        // 3. 复制按钮 (新增)
        // 默认为 true，以兼容旧设置
        if (s.showBtnCopy !== false) {
            const btnCopy = container.createDiv({ cls: 'image-hud-btn' });
            setIcon(btnCopy, 'copy');
            btnCopy.setAttribute('aria-label', t('HUD_BTN_COPY'));
            btnCopy.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.copyImageToClipboard();
            });
        }

        // 3. 转换/处理按钮 (切换)
        if (s.showBtnConvert) {
            const btnEdit = container.createDiv({ cls: 'image-hud-btn' });
            setIcon(btnEdit, 'switch');
            btnEdit.setAttribute('aria-label', t('HUD_BTN_EDIT'));
            btnEdit.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMenu(e, view);
            });
        }

        // 4. 删除按钮
        if (s.showBtnDelete) {
            const btnDelete = container.createDiv({ cls: 'image-hud-btn is-delete' });
            setIcon(btnDelete, 'trash');
            btnDelete.setAttribute('aria-label', t('HUD_BTN_DELETE'));
            btnDelete.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteImage(view);
            });
        }

        return container;
    }

    async loadMetadata(textEl: HTMLElement | null, tooltipEl: HTMLElement | null, settings: any) {
        const parts: string[] = [];
        
        if (settings.showFileType) {
            parts.push(this.file.extension.toUpperCase());
        }
        
        if (settings.showFileSize) {
            parts.push(formatBytes(this.file.stat.size));
        }
        
        if (settings.showDimensions) {
            const dimensions = await getImageDimensions(this.app, this.file);
            if (dimensions) {
                parts.push(`${dimensions.width}x${dimensions.height}`);
            }
        }
        
        const text = parts.join(' | ');
        
        // 更新可见文本
        if (textEl) textEl.setText(text);
        
        // 如果预览按钮存在，更新工具提示以显示元数据
        if (tooltipEl) {
            tooltipEl.setAttribute('aria-label', `${t('HUD_BTN_PREVIEW')}: ${text}`);
        }
    }

    showPreview(e: MouseEvent, target: HTMLElement) {
        // 创建弹出元素
        const popover = document.body.createDiv({ cls: 'image-hud-preview-popover' });
        
        // 加载图片
        const img = document.createElement('img');
        const resourcePath = this.app.vault.getResourcePath(this.file);
        img.src = resourcePath;
        
        popover.appendChild(img);
        
        // 定位弹出窗口
        const rect = target.getBoundingClientRect();
        popover.style.top = `${rect.bottom + 5}px`;
        popover.style.left = `${rect.left}px`;
        
        // 存储引用以便移除
        target.dataset.previewId = 'active';
        (window as any)._imageHudPreview = popover;
    }

    hidePreview() {
        const popover = (window as any)._imageHudPreview as HTMLElement;
        if (popover) {
            popover.remove();
            (window as any)._imageHudPreview = null;
        }
    }

    async deleteImage(view: EditorView) {
        // 1. 查找要删除的范围
        const pos = view.posAtDOM(this.dom);
        const line = view.state.doc.lineAt(pos);
        const textBefore = line.text.slice(0, pos - line.from);

        let deleteFrom = -1;

        // 向后搜索尝试找到链接的起点
        // 优先级 1: Wiki 链接 ![[...]]
        const lastWikiStart = textBefore.lastIndexOf('![[');
        if (lastWikiStart !== -1) {
            const candidate = textBefore.slice(lastWikiStart);
            if (/^!\[\[.*?\]\]$/.test(candidate)) {
                deleteFrom = pos - candidate.length;
            }
        }

        // 优先级 2: Markdown 链接 ![...](...)
        if (deleteFrom === -1) {
             const lastMdStart = textBefore.lastIndexOf('![');
             if (lastMdStart !== -1) {
                 const candidate = textBefore.slice(lastMdStart);
                 if (/^!\[.*?\]\(.*?\)$/.test(candidate)) {
                     deleteFrom = pos - candidate.length;
                 }
             }
        }

        if (deleteFrom !== -1) {
            // 确认删除
            
            // 删除文本
            view.dispatch({
                changes: { from: deleteFrom, to: pos }
            });

            // 删除文件
            try {
                await this.app.vault.trash(this.file, true); // true = 系统回收站, false = .trash 文件夹
                new Notice(t('HUD_BTN_DELETE') + ': Success');
            } catch (err) {
                console.error('Failed to delete file', err);
                new Notice('Failed to delete file: ' + err.message);
            }
        } else {
            new Notice('Could not find image link to delete.');
        }
    }

   async copyImageToClipboard() {
        try {
            const resourcePath = this.app.vault.getResourcePath(this.file);
            const response = await fetch(resourcePath);
            const blob = await response.blob();
            
            const clipboardItem = new ClipboardItem({
                [blob.type]: blob
            });
            
            await navigator.clipboard.write([clipboardItem]);
            new Notice(t('HUD_COPY_SUCCESS'));
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            new Notice(t('HUD_COPY_FAIL'));
        }
    }

    private showMenu(e: MouseEvent, view: EditorView) {
        const menu = new Menu();
        const processor = new ImageProcessor(this.app);
        
        const editor = this.getEditor(view);

        if (!editor) {
             console.error('Could not find editor instance');
             return;
        }

        // 从插件实例获取设置
        // 我们需要访问插件实例以获取设置。
        // 由于我们没有将插件传递给组件，因此可以通过 app.plugins 访问（非官方但有效）
        // 或者更好的做法是将插件设置或插件实例传递给组件构造函数。
        // 现在，先尝试通过 app 访问（使用 any 类型绕过私有检查或强制转换）
        // @ts-ignore
        const plugin = this.app.plugins.getPlugin('obsidian-image-hud') as ImageHUDPlugin;
        
        if (plugin && plugin.settings && plugin.settings.presets) {
            plugin.settings.presets.forEach(preset => {
                menu.addItem((item) => {
                    item
                        .setTitle(preset.name)
                        .setIcon('image-file') // TODO: 根据格式动态显示图标
                        .onClick(() => {
                            processor.processImage(this.file, preset, editor, this.linkStart, this.linkEnd, this.linkSuffix);
                        });
                });
            });
        }

        menu.addSeparator();

        menu.addItem((item) => {
            item
                .setTitle(t('MENU_ADVANCED_EXPORT'))
                .setIcon('settings')
                .onClick(() => {
                    new AdvancedExportModal(this.app, this.file, editor, this.linkStart, this.linkEnd).open();
                });
        });

        menu.showAtPosition({ x: e.pageX, y: e.pageY });
    }

    private getEditor(view: EditorView): Editor | null {
        // 将 CM6 视图映射回 Obsidian 编辑器
        // @ts-ignore
        const editor = view.dom.closest('.markdown-source-view')?.['cmEditor']?.editor;
        
        // 备用方案：遍历 leaves
        if (!editor) {
             const leaf = this.app.workspace.getMostRecentLeaf();
             if (leaf && leaf.view.getViewType() === 'markdown') {
                 // @ts-ignore
                 return leaf.view.editor;
             }
        }
        
        // 尝试从工作区获取编辑器
        return this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView)?.editor ?? null;
    }
}
