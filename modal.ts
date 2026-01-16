import { App, Modal, Setting, TFile, Editor } from 'obsidian';
import { ImageProcessor, ProcessOptions } from './processor';
import { t } from './lang/helpers';

export class AdvancedExportModal extends Modal {
    private options: ProcessOptions = {
        targetFormat: 'webp',
        quality: 0.8,
        resizeMode: 'none',
        resizeValue: 0
    };

    constructor(
        app: App, 
        private file: TFile, 
        private editor: Editor, 
        private linkStart: number,
        private linkEnd: number
    ) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: t('MODAL_TITLE') });

        // 图片预览
        const previewContainer = contentEl.createDiv({ cls: 'image-hud-modal-preview' });
        const img = document.createElement('img');
        img.src = this.app.vault.getResourcePath(this.file);
        previewContainer.appendChild(img);

        new Setting(contentEl)
            .setName(t('MODAL_FORMAT'))
            .setDesc(t('MODAL_FORMAT_DESC'))
            .addDropdown(dropdown => dropdown
                .addOption('webp', 'WebP')
                .addOption('png', 'PNG')
                .addOption('jpeg', 'JPEG')
                .setValue(this.options.targetFormat)
                .onChange(async (value) => {
                    this.options.targetFormat = value as any;
                    this.display(); // 刷新以显示/隐藏质量滑块
                }));

        if (this.options.targetFormat !== 'png') {
            new Setting(contentEl)
                .setName(t('MODAL_QUALITY'))
                .setDesc(t('MODAL_QUALITY_DESC'))
                .addSlider(slider => slider
                    .setLimits(0.1, 1.0, 0.01)
                    .setValue(this.options.quality)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.options.quality = value;
                    }));
        }

        new Setting(contentEl)
            .setName(t('MODAL_RESIZE_MODE'))
            .addDropdown(dropdown => dropdown
                .addOption('none', t('MODAL_MODE_ORIGINAL'))
                .addOption('scale', t('MODAL_MODE_SCALE'))
                .addOption('fixed_width', t('MODAL_MODE_FIXED'))
                .setValue(this.options.resizeMode)
                .onChange(async (value) => {
                    this.options.resizeMode = value as any;
                    // 切换模式时设置默认值
                    if (this.options.resizeMode === 'scale') this.options.resizeValue = 0.5;
                    if (this.options.resizeMode === 'fixed_width') this.options.resizeValue = 800;
                    this.display();
                }));

        if (this.options.resizeMode === 'scale') {
            new Setting(contentEl)
                .setName(t('MODAL_SCALE_PCT'))
                .addSlider(slider => slider
                    .setLimits(0.1, 1.0, 0.1)
                    .setValue(this.options.resizeValue)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.options.resizeValue = value;
                    }));
        } else if (this.options.resizeMode === 'fixed_width') {
            new Setting(contentEl)
                .setName(t('MODAL_WIDTH_PX'))
                .addText(text => text
                    .setValue(this.options.resizeValue.toString())
                    .onChange(async (value) => {
                        const val = parseInt(value);
                        if (!isNaN(val)) this.options.resizeValue = val;
                    }));
        }

        // 新选项：删除原始文件和使用 MD5
        new Setting(contentEl)
            .setName(t('SETTING_DELETE_ORIGINAL'))
            .addToggle(toggle => toggle
                .setValue(this.options.deleteOriginal || false)
                .onChange(async (value) => {
                    this.options.deleteOriginal = value;
                }));

        new Setting(contentEl)
            .setName(t('SETTING_USE_MD5'))
            .addToggle(toggle => toggle
                .setValue(this.options.useMD5 || false)
                .onChange(async (value) => {
                    this.options.useMD5 = value;
                }));

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText(t('MODAL_BTN_GENERATE'))
                .setCta()
                .onClick(() => {
                    const processor = new ImageProcessor(this.app);
                    processor.processImage(this.file, this.options, this.editor, this.linkStart, this.linkEnd);
                    this.close();
                }));
    }

    display() {
        this.onOpen();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
