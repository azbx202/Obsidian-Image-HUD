export default {
  // HUD
  HUD_LOADING: "加载中...",
  HUD_BTN_PREVIEW: "预览图片",
  HUD_BTN_SYSTEM_EDIT: "调用系统编辑",
  HUD_BTN_EDIT: "转换/处理",
  HUD_BTN_COPY: "复制图片到剪贴板",
  HUD_BTN_DELETE: "删除图片及链接",
  HUD_COPY_SUCCESS: "图片已复制到剪贴板",
  HUD_COPY_FAIL: "复制图片失败",

  // 菜单
  MENU_QUICK_WEBP: "快速转 WebP (80%)",
  MENU_QUICK_COMPRESS: "快速压缩 (PNG 60%)",
  MENU_ADVANCED_EXPORT: "自定义转换...",

  // 模态框
  MODAL_TITLE: "自定义图片转换",
  MODAL_FORMAT: "格式",
  MODAL_FORMAT_DESC: "选择输出格式",
  MODAL_QUALITY: "质量",
  MODAL_QUALITY_DESC: "压缩质量 (0.1 - 1.0)",
  MODAL_RESIZE_MODE: "缩放模式",
  MODAL_MODE_ORIGINAL: "原始尺寸",
  MODAL_MODE_SCALE: "缩放比例",
  MODAL_MODE_FIXED: "固定宽度",
  MODAL_SCALE_PCT: "缩放百分比 (0.1 - 1.0)",
  MODAL_WIDTH_PX: "宽度 (px)",
  MODAL_BTN_GENERATE: "生成副本",

  // Processor
  PROC_PROCESSING: "正在处理 ${name}...",
  PROC_SUCCESS: "已创建: ${name}",
  PROC_FAIL_BLOB: "生成图片数据失败",
  PROC_FAIL_CANVAS: "浏览器不支持 Canvas Context",
  PROC_FAIL_LOAD: "加载图片失败",
  PROC_FAIL_GENERIC: "处理失败",
  PROC_FAIL_SIZE_TOO_SMALL: "处理失败：计算后的图片尺寸过小 (宽或高 < 1px)",

  // Settings
  SETTING_LANG_NAME: "语言",
  SETTING_LANG_DESC: "选择显示语言。(需要重启插件或重载)",
  SETTING_LANG_AUTO: "自动 (跟随 Obsidian)",

  SETTING_EDITOR_PATH: "外部图片编辑器路径",
  SETTING_EDITOR_PATH_DESC: "输入可执行文件的绝对路径（如 Photoshop.exe）。留空则使用系统默认应用打开。",
  SETTING_EDITOR_PATH_PLACEHOLDER: "例如：C:\\photoshop.exe",

  SETTING_PRESETS_TITLE: "快捷操作预设",
  SETTING_PRESETS_DESC: "自定义 HUD 菜单中显示的快捷操作。",
  SETTING_ADD_PRESET: "添加预设",
  SETTING_RESET_PRESETS: "恢复默认预设",
  SETTING_RESET_CONFIRM: "确定要恢复默认预设吗？这将清空所有自定义预设。",
  SETTING_PRESET_NAME: "预设名称",
  SETTING_PRESET_NAME_PLACEHOLDER: "例如：缩小版 WebP",
  SETTING_DELETE_ORIGINAL: "转换后删除原图",
  SETTING_USE_MD5: "使用 MD5 命名",
  SETTING_DELETE: "删除",

  // HUD 元素
  SETTING_HUD_ELEMENTS: "HUD 元素显示",
  SETTING_SHOW_INFO: "显示图片信息",
  SETTING_SHOW_FILE_SIZE: "显示文件大小",
  SETTING_SHOW_FILE_TYPE: "显示文件类型",
  SETTING_SHOW_DIMENSIONS: "显示图片尺寸",
  SETTING_SHOW_BTN_PREVIEW: "显示预览按钮",
  SETTING_SHOW_BTN_SYSEDIT: "显示系统编辑按钮",
  SETTING_SHOW_BTN_COPY: "显示复制按钮",
  SETTING_SHOW_BTN_CONVERT: "显示转换按钮",
  SETTING_SHOW_BTN_DELETE: "显示删除按钮",
};
