export default {
  // HUD
  HUD_LOADING: "Loading...",
  HUD_BTN_PREVIEW: "Preview",
  HUD_BTN_SYSTEM_EDIT: "Edit in Default App",
  HUD_BTN_EDIT: "Convert / Process",
  HUD_BTN_COPY: "Copy Image to Clipboard",
  HUD_BTN_DELETE: "Delete Image & Link",
  HUD_COPY_SUCCESS: "Image copied to clipboard",
  HUD_COPY_FAIL: "Failed to copy image",

  // 菜单
  MENU_QUICK_WEBP: "Quick WebP (80%)",
  MENU_QUICK_COMPRESS: "Quick Compress (PNG 60%)",
  MENU_ADVANCED_EXPORT: "Custom Convert...",

  // 模态框
  MODAL_TITLE: "Custom Image Convert",
  MODAL_FORMAT: "Format",
  MODAL_FORMAT_DESC: "Select output format",
  MODAL_QUALITY: "Quality",
  MODAL_QUALITY_DESC: "Compression quality (0.1 - 1.0)",
  MODAL_RESIZE_MODE: "Resize Mode",
  MODAL_MODE_ORIGINAL: "Original Size",
  MODAL_MODE_SCALE: "Scale Percentage",
  MODAL_MODE_FIXED: "Fixed Width",
  MODAL_SCALE_PCT: "Scale % (0.1 - 1.0)",
  MODAL_WIDTH_PX: "Width (px)",
  MODAL_BTN_GENERATE: "Generate Copy",
  
  // 处理器
  PROC_PROCESSING: "Processing ${name}...",
  PROC_SUCCESS: "Created: ${name}",
  PROC_FAIL_GENERIC: "Processing failed",
  PROC_FAIL_SIZE_TOO_SMALL: "Processing failed: Resulting image size too small (< 1px)",
  PROC_FAIL_CANVAS: "Canvas context not supported",
  PROC_FAIL_LOAD: "Failed to load image",

  // 设置
  SETTING_LANG_NAME: "Language",
  SETTING_LANG_DESC: "Choose the display language. (Requires reload)",
  SETTING_LANG_AUTO: "Auto (Follow Obsidian)",

  SETTING_EDITOR_PATH: "External Image Editor Path",
  SETTING_EDITOR_PATH_DESC: "Absolute path to the executable (e.g., Photoshop.exe). Leave empty to use system default.",
  SETTING_EDITOR_PATH_PLACEHOLDER: "e.g. /Applications/Photoshop.app",

  SETTING_PRESETS_TITLE: "Quick Action Presets",
  SETTING_PRESETS_DESC: "Customize the quick actions available in the HUD menu.",
  SETTING_ADD_PRESET: "Add Preset",
  SETTING_RESET_PRESETS: "Restore Default Presets",
  SETTING_RESET_CONFIRM: "Are you sure you want to restore default presets? This will remove all custom presets.",
  SETTING_PRESET_NAME: "Preset Name",
  SETTING_PRESET_NAME_PLACEHOLDER: "e.g. Small WebP",
  SETTING_DELETE_ORIGINAL: "Delete Original",
  SETTING_USE_MD5: "Use MD5 Naming",
  SETTING_DELETE: "Delete",

  // HUD 元素
  SETTING_HUD_ELEMENTS: "HUD Elements Display",
  SETTING_SHOW_INFO: "Show Image Info",
  SETTING_SHOW_FILE_SIZE: "Show File Size",
  SETTING_SHOW_FILE_TYPE: "Show File Type",
  SETTING_SHOW_DIMENSIONS: "Show Dimensions",
  SETTING_SHOW_BTN_PREVIEW: "Show Preview Button",
  SETTING_SHOW_BTN_SYSEDIT: "Show System Edit Button",
  SETTING_SHOW_BTN_COPY: "Show Copy Button",
  SETTING_SHOW_BTN_CONVERT: "Show Convert Button",
  SETTING_SHOW_BTN_DELETE: "Show Delete Button",
};
