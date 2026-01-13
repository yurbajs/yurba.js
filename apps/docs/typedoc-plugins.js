const { ReflectionKind } = require('typedoc');

/**
 * @param {import('typedoc').Application} app
 */
exports.load = function (app) {


    app.renderer.on('beginRender', () => {
        const theme = app.renderer.theme;
        if (theme) {
            const originalGetRenderContext = theme.getRenderContext;
            theme.getRenderContext = function (page) {
                const context = originalGetRenderContext.call(this, page);

                // 1. Override the reflection template
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
                        const extendsTypes = model.typeHierarchy.types.map((t) =>
                            context.helpers.getHierarchyType(t, { isTarget: false })
                        );

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

                // 2. Override the memberContainer partial
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

                            const apiInfoBlock = `<div class="api-info"><span class="${badgeClass}">${method}</span> <span class="api-path">${path}</span> ${iconHtml}</div>`;

                            // Inject after the first heading found in the member container
                            md = md.replace(/^(#+ .*)$/m, `$1\n${apiInfoBlock}`);
                        }
                    }

                    return md;
                };

                // 3. Override the comment partial to hide @rest tag
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

                // 4. Override the hierarchy partial to skip the "Extends" section at the bottom
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
