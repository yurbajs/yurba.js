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

                // 1. Override the reflection template to insert "Extends" right under the title
                const originalReflectionTemplate = context.templates.reflection;
                context.templates.reflection = function (page) {
                    // Use context explicitly instead of this
                    let md = originalReflectionTemplate.call(context, page);

                    const model = page.model;
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
                            // Insert right after the H1 title line
                            md = md.replace(/^(# (?:Class|Interface): .*)$/m, `$1\n${extendsBlock}`);
                        }
                    }
                    return md;
                };

                // 2. Override the hierarchy partial to skip the "Extends" section at the bottom
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
