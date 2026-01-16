import { ViewUpdate, PluginValue, ViewPlugin, DecorationSet, Decoration, EditorView } from '@codemirror/view';
import { App, TFile } from 'obsidian';
import { ImageInfoWidget } from './widget';
import { getImageFile } from './utils';

export const imageHUDPlugin = (app: App) => ViewPlugin.fromClass(class implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const text = view.state.doc.toString();
        
        // 匹配 Wiki 链接 [[image.png]]
        const wikiLinkRegex = /!\[\[(.*?)\]\]/g;
        // 匹配 Markdown 链接 ![alt](image.png)
        const mdLinkRegex = /!\[.*?\]\((.*?)\)/g;

        // 遍历可见区域以优化性能
        for (const { from, to } of view.visibleRanges) {
            const rangeText = text.slice(from, to);
            
            // 处理 Wiki 链接: ![[image.png]]
            let match;
            while ((match = wikiLinkRegex.exec(rangeText)) !== null) {
                const linkText = match[1];
                const start = from + match.index;
                const end = start + match[0].length;
                
                // 获取链接对应的文件对象
                
                const file = this.getFileFromLink(linkText);
                
                if (file) {
                    const hudId = `hud-${start}-${end}`; // 唯一 ID

                    // 提取后缀 (如 |100 或 #bg)
                    let suffix = '';
                    const pipeIndex = linkText.indexOf('|');
                    const hashIndex = linkText.indexOf('#');
                    // 找到最早出现的 | 或 #
                    let splitIndex = -1;
                    if (pipeIndex !== -1 && hashIndex !== -1) {
                        splitIndex = Math.min(pipeIndex, hashIndex);
                    } else if (pipeIndex !== -1) {
                        splitIndex = pipeIndex;
                    } else if (hashIndex !== -1) {
                        splitIndex = hashIndex;
                    }

                    if (splitIndex !== -1) {
                        suffix = linkText.substring(splitIndex);
                    }

                    // 为链接文本添加标记装饰以便处理悬停
                    builder.add(
                        start,
                        end,
                        Decoration.mark({
                            class: 'image-hud-link',
                            attributes: { 
                                'data-image-path': file.path,
                                'data-hud-id': hudId
                            }
                        })
                    );

                    builder.add(
                        end, 
                        end, 
                        Decoration.widget({
                            widget: new ImageInfoWidget(app, file, start, end, hudId, suffix),
                            side: 1
                        })
                    );
                }
            }

            // 处理 Markdown 链接: ![alt](image.png)
            let mdMatch;
            while ((mdMatch = mdLinkRegex.exec(rangeText)) !== null) {
                const altText = mdMatch[1];
                const linkUrl = mdMatch[2];
                const start = from + mdMatch.index;
                const end = start + mdMatch[0].length;

                const file = this.getFileFromLink(linkUrl);
                if (file) {
                    const hudId = `hud-${start}-${end}`; // 唯一 ID

                    // 对于 MD 链接，alt 文本即为后缀参数
                    const suffix = altText ? `|${altText}` : '';

                    // 为链接文本添加标记装饰
                    builder.add(
                        start,
                        end,
                        Decoration.mark({
                            class: 'image-hud-link',
                            attributes: { 
                                'data-image-path': file.path,
                                'data-hud-id': hudId
                            }
                        })
                    );

                    builder.add(
                        end, 
                        end, 
                        Decoration.widget({
                            widget: new ImageInfoWidget(app, file, start, end, hudId, suffix),
                            side: 1
                        })
                    );
                }
            }
        }

        return builder.finish();
    }

    getFileFromLink(linkText: string): TFile | null {
        // 获取当前活动文件作为源路径
        const activeFile = app.workspace.getActiveFile();
        const sourcePath = activeFile ? activeFile.path : '';
        
        return getImageFile(app, linkText, sourcePath);
    }
}, {
    decorations: v => v.decorations,
    eventHandlers: {
        mousemove: (e, view) => {
            const target = e.target as HTMLElement;
            const linkTarget = target.closest('.image-hud-link');
            const hudTarget = target.closest('.image-hud-container');
            const hudId = (linkTarget || hudTarget)?.getAttribute('data-hud-id');

            if (hudId) {
                showHud(hudId);
            } else {
                hideAllHuds();
            }
        }
    }
});

function showHud(hudId: string) {
    const allHuds = document.querySelectorAll('.image-hud-container');
    allHuds.forEach(hud => {
        if (hud.getAttribute('data-hud-id') === hudId) {
            hud.addClass('is-visible');
        } else {
            hud.removeClass('is-visible');
        }
    });
}

function hideAllHuds() {
    const visibleHuds = document.querySelectorAll('.image-hud-container.is-visible');
    visibleHuds.forEach(hud => {
        hud.removeClass('is-visible');
    });
}

// 需要导入 RangeSetBuilder
import { RangeSetBuilder } from '@codemirror/state';
