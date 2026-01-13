const { ReflectionKind } = require('typedoc');
const fs = require('fs');
const path = require('path');

/**
 * @param {import('typedoc').Application} app
 */
exports.load = function (app) {
    // Post-process sidebar after it's generated
    app.renderer.on('endRender', () => {
        const outDir = app.renderer.outputDirectory || path.resolve(process.cwd(), app.options.getValue('out'));
        const sidebarPath = path.resolve(outDir, 'typedoc-sidebar.json');
        if (fs.existsSync(sidebarPath)) {
            try {
                let sidebar = JSON.parse(fs.readFileSync(sidebarPath, 'utf-8'));

                const fixItems = (items) => {
                    if (!items) return items;

                    let newItems = [];
                    items.forEach(item => {
                        if (item.text === 'None' || item.text === 'Other') {
                            if (item.items) {
                                // Flatten children of "None" or "Other"
                                newItems.push(...item.items);
                            }
                        } else {
                            // Recursively fix children
                            if (item.items) {
                                item.items = fixItems(item.items);
                            }
                            newItems.push(item);
                        }
                    });

                    // Sort: items without sub-items (flattened classes) first, then by text
                    newItems.sort((a, b) => {
                        const aHasSubItems = a.items && a.items.length > 0;
                        const bHasSubItems = b.items && b.items.length > 0;

                        if (aHasSubItems && !bHasSubItems) return 1;
                        if (!aHasSubItems && bHasSubItems) return -1;

                        return a.text.localeCompare(b.text);
                    });

                    return newItems;
                };

                // Apply fix to the entire sidebar
                const fixedSidebar = fixItems(sidebar);

                fs.writeFileSync(sidebarPath, JSON.stringify(fixedSidebar, null, 2));
            } catch (err) {
                console.error('Error post-processing sidebar:', err);
            }
        }
    });

    app.renderer.on('beginRender', () => {
        const theme = app.renderer.theme;
        if (theme) {
            const originalGetRenderContext = theme.getRenderContext;
            theme.getRenderContext = function (page) {
                const context = originalGetRenderContext.call(this, page);

                // Override the reflection template
                const originalReflectionTemplate = context.templates.reflection;
                context.templates.reflection = function (page) {
                    let md = originalReflectionTemplate.call(context, page);
                    const model = page.model;

                    // Handle Extends blockquote
                    if (
                        (model.kind === ReflectionKind.Class || model.kind === ReflectionKind.Interface) &&
                        model.typeHierarchy &&
                        model.typeHierarchy.next
                    ) {
                        const extendsTypes = model.typeHierarchy.types.map((t) => {
                            // Check if the type has a reflection (is a documented type)
                            if (t.reflection) {
                                const url = context.urlTo(t.reflection);
                                const name = t.reflection.name;
                                return `[${name}](${url})`;
                            }
                            // Fallback to plain text for external types
                            return context.helpers.getHierarchyType(t, { isTarget: false });
                        });

                        if (extendsTypes.length > 0) {
                            const extendsBlock = `> Extends: ${extendsTypes.join(', ')}`;
                            md = md.replace(/^(# (?:Class|Interface): .*)$/m, `$1\n${extendsBlock}`);
                        }
                    }
                    return md;
                };

                // Helper to extract @rest tag
                const getRestTag = (model) => {
                    let tag = model.comment?.blockTags?.find(t => t.tag === '@rest');
                    if (!tag && model.signatures) {
                        for (const sig of model.signatures) {
                            tag = sig.comment?.blockTags?.find(t => t.tag === '@rest');
                            if (tag) break;
                        }
                    }
                    return tag;
                };

                // Override the memberContainer partial
                const originalMemberContainer = context.partials.memberContainer;
                context.partials.memberContainer = function (model, options) {
                    let md = originalMemberContainer.call(context, model, options);

                    const restTag = getRestTag(model);
                    if (restTag) {
                        const content = restTag.content.map(c => c.text).join('').trim();
                        const parts = content.split(/\s+/);
                        if (parts.length >= 2) {
                            const method = parts[0];
                            const path = parts[1];
                            let link = parts[2];

                            // Prepend base URL if link is a path
                            if (link && !link.startsWith('http')) {
                                link = `https://docs.yurba.one/${link.replace(/^\//, '')}`;
                            }

                            const badgeClass = `api-badge api-badge-${method.toLowerCase()}`;
                            const iconSrc = link ? '/icons/link.svg' : '/icons/link-slash.svg';

                            const iconHtml = link
                                ? `<a href="${link}" target="_blank" class="api-link-icon"><img src="${iconSrc}" alt="API Docs" /></a>`
                                : `<span class="api-link-icon no-link"><img src="${iconSrc}" alt="No API Docs" /></span>`;

                            const apiInfoBlock = `<div class="api-info"><span class="${badgeClass}">${method}</span> <span class="api-path" title="Click to copy" data-copy-text="${path}">${path}</span> ${iconHtml}</div>`;

                            // Inject after the first heading found in the member container
                            md = md.replace(/^(#+ .*)$/m, `$1\n${apiInfoBlock}`);
                        }
                    }

                    return md;
                };

                // Override the comment partial to hide @rest tag
                const originalComment = context.partials.comment;
                context.partials.comment = function (comment, options) {
                    if (comment && comment.blockTags) {
                        // Filter out @rest tag from blockTags before rendering
                        const filteredBlockTags = comment.blockTags.filter(tag => tag.tag !== '@rest');
                        const originalBlockTags = comment.blockTags;

                        // Temporarily replace blockTags
                        comment.blockTags = filteredBlockTags;
                        const md = originalComment.call(context, comment, options);

                        // Restore blockTags
                        comment.blockTags = originalBlockTags;
                        return md;
                    }
                    return originalComment.call(context, comment, options);
                };

                // Override the hierarchy partial to skip the "Extends" section at the bottom
                const originalHierarchy = context.partials.hierarchy;
                context.partials.hierarchy = function (model, options) {
                    if (model && !model.isTarget && model.next) {
                        return '';
                    }
                    return originalHierarchy.call(context, model, options);
                };

                return context;
            };
        }
    });
};
