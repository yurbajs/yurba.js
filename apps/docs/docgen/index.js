const path = require('path');
const { processSidebar } = require('./processors/sidebar');
const { processMarkdown } = require('./processors/markdown');
const { patchReflection } = require('./renderers/reflection');
const { patchMemberContainer } = require('./renderers/member');
const { patchComment } = require('./renderers/comment');
const { patchTypeParametersList, patchParametersList, patchHierarchy } = require('./renderers/parameters');

/**
 * @param {import('typedoc').Application} app
 */
exports.load = function (app) {
  app.renderer.on('endRender', () => {
    const outDir = app.renderer.outputDirectory || 
      path.resolve(process.cwd(), app.options.getValue('out'));
    
    processSidebar(outDir);
    processMarkdown(outDir);
  });

  app.renderer.on('beginRender', () => {
    const theme = app.renderer.theme;
    if (!theme) return;

    const originalGetRenderContext = theme.getRenderContext;
    theme.getRenderContext = function (page) {
      const context = originalGetRenderContext.call(this, page);

      patchReflection(context);
      patchMemberContainer(context);
      patchComment(context);
      patchTypeParametersList(context);
      patchParametersList(context);
      patchHierarchy(context);

      return context;
    };
  });
};
