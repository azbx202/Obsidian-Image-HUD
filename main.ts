import { Plugin, PluginSettingTab, Setting, App, Notice } from 'obsidian';
import { imageHUDPlugin } from './view-plugin';
import { setLocale, t } from './lang/helpers';
import { ProcessOptions } from './processor';

export interface ImagePreset extends ProcessOptions {
    name: string;
}

interface ImageHUDSettings {
    language: string;
    editorAppPath: string;
    presets: ImagePreset[];
    // HUD 显示设置
    showFileSize: boolean;
    showFileType: boolean;
    showDimensions: boolean;
    showBtnPreview: boolean;
    showBtnSysEdit: boolean;
    showBtnConvert: boolean;
    showBtnDelete: boolean;
}

const DEFAULT_PRESETS: ImagePreset[] = [
    {
        name: "Quick WebP (80%)",
        targetFormat: 'webp',
        quality: 0.8,
        resizeMode: 'none',
        resizeValue: 0
    },
    {
        name: "Quick JPG (80%)",
        targetFormat: 'jpeg',
        quality: 0.8,
        resizeMode: 'none',
        resizeValue: 0
    },
    {
        name: "Quick Scale 50% (WebP 90%)",
        targetFormat: 'webp',
        quality: 0.9,
        resizeMode: 'scale',
        resizeValue: 0.5
    }
];

const DEFAULT_SETTINGS: ImageHUDSettings = {
    language: 'auto',
    editorAppPath: '',
    presets: [...DEFAULT_PRESETS],
    showFileSize: true,
    showFileType: true,
    showDimensions: true,
    showBtnPreview: true,
    showBtnSysEdit: true,
    showBtnCopy: true,
    showBtnConvert: true,
    showBtnDelete: true
}

export default class ImageHUDPlugin extends Plugin {
    settings: ImageHUDSettings;

	async onload() {
		console.log('Loading Image HUD plugin');
        
        await this.loadSettings();
        
        // 初始化语言环境
        setLocale(this.settings.language);

		this.registerEditorExtension(imageHUDPlugin(this.app));
        
        this.addSettingTab(new ImageHUDSettingTab(this.app, this));
	}

	async onunload() {
		console.log('Unloading Image HUD plugin');
	}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        // 如果从旧版本升级，确保预设存在
        if (!this.settings.presets || this.settings.presets.length === 0) {
            this.settings.presets = [...DEFAULT_PRESETS];
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class ImageHUDSettingTab extends PluginSettingTab {
    plugin: ImageHUDPlugin;
    private tempPreset: ImagePreset;

    constructor(app: App, plugin: ImageHUDPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.resetTempPreset();
    }

    resetTempPreset() {
        this.tempPreset = {
            name: '',
            targetFormat: 'webp',
            quality: 0.8,
            resizeMode: 'none',
            resizeValue: 0,
            deleteOriginal: false,
            useMD5: false
        };
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName(t('SETTING_LANG_NAME'))
            .setDesc(t('SETTING_LANG_DESC'))
            .addDropdown(dropdown => dropdown
                .addOption('auto', t('SETTING_LANG_AUTO'))
                .addOption('en', 'English')
                .addOption('zh', '中文')
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                    setLocale(value);
                    this.display();
                }));

        new Setting(containerEl)
            .setName(t('SETTING_EDITOR_PATH'))
            .setDesc(t('SETTING_EDITOR_PATH_DESC'))
            .addText(text => text
                .setPlaceholder(t('SETTING_EDITOR_PATH_PLACEHOLDER'))
                .setValue(this.plugin.settings.editorAppPath)
                .onChange(async (value) => {
                    this.plugin.settings.editorAppPath = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: t('SETTING_HUD_ELEMENTS') });

        new Setting(containerEl)
            .setName(t('SETTING_SHOW_FILE_SIZE'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFileSize)
                .onChange(async (value) => {
                    this.plugin.settings.showFileSize = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('SETTING_SHOW_FILE_TYPE'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFileType)
                .onChange(async (value) => {
                    this.plugin.settings.showFileType = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('SETTING_SHOW_DIMENSIONS'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showDimensions)
                .onChange(async (value) => {
                    this.plugin.settings.showDimensions = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('SETTING_SHOW_BTN_PREVIEW'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showBtnPreview)
                .onChange(async (value) => {
                    this.plugin.settings.showBtnPreview = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('SETTING_SHOW_BTN_SYSEDIT'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showBtnSysEdit)
                .onChange(async (value) => {
                    this.plugin.settings.showBtnSysEdit = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('SETTING_SHOW_BTN_COPY'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showBtnCopy)
                .onChange(async (value) => {
                    this.plugin.settings.showBtnCopy = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('SETTING_SHOW_BTN_CONVERT'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showBtnConvert)
                .onChange(async (value) => {
                    this.plugin.settings.showBtnConvert = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('SETTING_SHOW_BTN_DELETE'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showBtnDelete)
                .onChange(async (value) => {
                    this.plugin.settings.showBtnDelete = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: t('SETTING_PRESETS_TITLE') });
        containerEl.createEl('p', { text: t('SETTING_PRESETS_DESC'), cls: 'setting-item-description' });

        // 列出已有预设
        this.plugin.settings.presets.forEach((preset, index) => {
            let desc = `${preset.targetFormat.toUpperCase()} | ${Math.round(preset.quality * 100)}% Quality | ${this.getResizeDesc(preset)}`;
            if (preset.deleteOriginal) desc += ` | ${t('SETTING_DELETE_ORIGINAL')}`;
            if (preset.useMD5) desc += ` | ${t('SETTING_USE_MD5')}`;

            const setting = new Setting(containerEl)
                .setName(preset.name)
                .setDesc(desc)
                .addButton(btn => btn
                    .setButtonText(t('SETTING_DELETE'))
                    .setIcon('trash')
                    .setWarning()
                    .onClick(async () => {
                        this.plugin.settings.presets.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    }));
        });

        // 添加新预设区域
        const addDiv = containerEl.createDiv();
        addDiv.style.borderTop = '1px solid var(--background-modifier-border)';
        addDiv.style.marginTop = '20px';
        addDiv.style.paddingTop = '10px';
        addDiv.createEl('h4', { text: t('SETTING_ADD_PRESET') });

        new Setting(addDiv)
            .setName(t('SETTING_PRESET_NAME'))
            .addText(text => text
                .setPlaceholder(t('SETTING_PRESET_NAME_PLACEHOLDER'))
                .setValue(this.tempPreset.name)
                .onChange(value => this.tempPreset.name = value));

        new Setting(addDiv)
            .setName(t('MODAL_FORMAT'))
            .addDropdown(dropdown => dropdown
                .addOption('webp', 'WebP')
                .addOption('png', 'PNG')
                .addOption('jpeg', 'JPEG')
                .setValue(this.tempPreset.targetFormat)
                .onChange(value => this.tempPreset.targetFormat = value as any));
        
        new Setting(addDiv)
            .setName(t('MODAL_QUALITY'))
            .addSlider(slider => slider
                .setLimits(0.1, 1.0, 0.01)
                .setValue(this.tempPreset.quality)
                .setDynamicTooltip()
                .onChange(value => this.tempPreset.quality = value));

        new Setting(addDiv)
            .setName(t('MODAL_RESIZE_MODE'))
            .addDropdown(dropdown => dropdown
                .addOption('none', t('MODAL_MODE_ORIGINAL'))
                .addOption('scale', t('MODAL_MODE_SCALE'))
                .addOption('fixed_width', t('MODAL_MODE_FIXED'))
                .setValue(this.tempPreset.resizeMode)
                .onChange(value => {
                    this.tempPreset.resizeMode = value as any;
                    // 重置值以简化快速添加界面
                    if (this.tempPreset.resizeMode === 'scale') this.tempPreset.resizeValue = 0.5;
                    if (this.tempPreset.resizeMode === 'fixed_width') this.tempPreset.resizeValue = 800;
                    if (this.tempPreset.resizeMode === 'none') this.tempPreset.resizeValue = 0;
                    
                    // 重新渲染以显示/隐藏值输入框
                    this.display();
                }));

        if (this.tempPreset.resizeMode !== 'none') {
            new Setting(addDiv)
                .setName(t('MODAL_SCALE_PCT') + ' / ' + t('MODAL_WIDTH_PX'))
                .setDesc('0.5 = 50%, 800 = 800px')
                .addText(text => text
                    .setValue(this.tempPreset.resizeValue.toString())
                    .onChange(value => {
                        const val = parseFloat(value);
                        if (!isNaN(val)) this.tempPreset.resizeValue = val;
                    }));
        }

        new Setting(addDiv)
            .setName(t('SETTING_DELETE_ORIGINAL'))
            .addToggle(toggle => toggle
                .setValue(this.tempPreset.deleteOriginal || false)
                .onChange(value => this.tempPreset.deleteOriginal = value));

        new Setting(addDiv)
            .setName(t('SETTING_USE_MD5'))
            .addToggle(toggle => toggle
                .setValue(this.tempPreset.useMD5 || false)
                .onChange(value => this.tempPreset.useMD5 = value));

        new Setting(addDiv)
            .addButton(btn => btn
                .setButtonText(t('SETTING_ADD_PRESET'))
                .setCta()
                .onClick(async () => {
                    if (!this.tempPreset.name) {
                        new Notice('Preset name is required');
                        return;
                    }
                    this.plugin.settings.presets.push({ ...this.tempPreset });
                    await this.plugin.saveSettings();
                    this.resetTempPreset();
                    this.display();
                }));

        // 重置默认值区域
        const resetDiv = containerEl.createDiv();
        resetDiv.style.borderTop = '1px solid var(--background-modifier-border)';
        resetDiv.style.marginTop = '20px';
        resetDiv.style.paddingTop = '10px';

        new Setting(resetDiv)
            .setName(t('SETTING_RESET_PRESETS'))
            .addButton(btn => btn
                .setButtonText('Reset')
                .setWarning()
                .onClick(async () => {
                    if (!confirm(t('SETTING_RESET_CONFIRM'))) return;
                    
                    this.plugin.settings.presets = [...DEFAULT_PRESETS];
                    await this.plugin.saveSettings();
                    this.display();
                }));
    }

    getResizeDesc(preset: ImagePreset): string {
        if (preset.resizeMode === 'none') return t('MODAL_MODE_ORIGINAL');
        if (preset.resizeMode === 'scale') return `${t('MODAL_MODE_SCALE')} ${Math.round(preset.resizeValue * 100)}%`;
        if (preset.resizeMode === 'fixed_width') return `${t('MODAL_MODE_FIXED')} ${preset.resizeValue}px`;
        return '';
    }
}
