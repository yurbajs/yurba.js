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

    // Post-process markdown files to transform Returns section
    const processMarkdownFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          processMarkdownFiles(filePath);
        } else if (file.endsWith('.md')) {
          let content = fs.readFileSync(filePath, 'utf-8');
          // Transform Returns section: wrap return type and description in blockquote
          content = content.replace(/(#### Returns\n\n)(`[^`]+`)\n\n([^\n#]+)/g, '$1> $2\n> ? $3');
          fs.writeFileSync(filePath, content);
        }
      });
    };

    try {
      processMarkdownFiles(outDir);
    } catch (err) {
      console.error('Error post-processing markdown files:', err);
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

        // Helper to get @since tag
        const getSinceTag = (model) => {
          let tag = model.comment?.blockTags?.find(t => t.tag === '@since');
          if (!tag && model.signatures) {
            for (const sig of model.signatures) {
              tag = sig.comment?.blockTags?.find(t => t.tag === '@since');
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
          const sinceTag = getSinceTag(model);

          // Transform method signature format
          md = md.replace(/(###+ )(\w+)\(\)\n\n> \*\*\2\*\*\(([^)]+)\): (.+?)\n\n([^\n]+)/gs, (match, hashes, name, params, returnType, description) => {
            let result = `${hashes}.${name}(\`${params}\`): \`${returnType}\`\n\n`;
            
            if (restTag) {
              const content = restTag.content.map(c => c.text).join('').trim();
              const parts = content.split(/\s+/);
              if (parts.length >= 2) {
                const method = parts[0];
                const path = parts[1];
                let link = parts[2];

                if (link && !link.startsWith('http')) {
                  link = `https://docs.yurba.one/${link.replace(/^\//, '')}`;
                }

                const badgeClass = `api-badge api-badge-${method.toLowerCase()}`;
                const iconSrc = link ? '/icons/link.svg' : '/icons/link-slash.svg';

                const iconHtml = link
                  ? `<a href="${link}" target="_blank" class="api-link-icon"><img src="${iconSrc}" alt="API Docs" /></a>`
                  : `<span class="api-link-icon no-link"><img src="${iconSrc}" alt="No API Docs" /></span>`;

                let sinceBadge = '';
                if (sinceTag) {
                  const version = sinceTag.content.map(c => c.text).join('').trim();
                  sinceBadge = ` <span class="api-since-badge"><img src="/icons/since.svg" alt="Since" />${version}</span>`;
                }

                result += `<div class="api-info"><span class="${badgeClass}">${method}</span> <span class="api-path" title="Click to copy" data-copy-text="${path}">${path}</span> ${iconHtml}${sinceBadge}</div>\n\n`;
              }
            }
            
            result += `> <div class="api-description">${description}</div>`;
            return result;
          });

          return md;
        };

        // Override the comment partial to hide @rest and @since tags
        const originalComment = context.partials.comment;
        context.partials.comment = function (comment, options) {
          if (comment && comment.blockTags) {
            // Filter out @rest and @since tags from blockTags before rendering
            const filteredBlockTags = comment.blockTags.filter(tag => tag.tag !== '@rest' && tag.tag !== '@since');
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

        // Override parameter rendering to use tables
        const originalParameter = context.partials.parameter;
        context.partials.parameter = function (item, options) {
          // Let TypeDoc handle the initial rendering
          return originalParameter.call(context, item, options);
        };

        // Override typeParametersList to use table format
        const originalTypeParametersList = context.partials.typeParametersList;
        context.partials.typeParametersList = function (model, options) {
          if (!model || model.length === 0) return '';

          let md = '\n| Name | Type | Description |\n';
          md += '|------|------|-------------|\n';

          model.forEach(param => {
            const name = `\`${param.name}\``;
            const type = param.type ? context.partials.someType(param.type) : '`any`';
            let desc = '';
            if (param.comment?.summary) {
              desc = param.comment.summary.map(p => p.text || '').join('').trim();
            }

            md += `| ${name} | ${type} | ${desc} |\n`;
          });

          return md + '\n';
        };

        // Override parametersList to use table format
        const originalParametersList = context.partials.parametersList;
        context.partials.parametersList = function (model, options) {
          if (!model || model.length === 0) return '';

          let md = '\n| Name | Type | Description |\n';
          md += '|------|------|-------------|\n';

          model.forEach(param => {
            const isOptional = param.flags?.isOptional || param.defaultValue;
            const name = `\`${param.name}${isOptional ? '?' : ''}\``;
            const type = param.type ? context.partials.someType(param.type) : '`any`';
            let desc = '';
            if (param.comment?.summary) {
              desc = param.comment.summary.map(p => p.text || '').join('').trim();
            }

            md += `| ${name} | ${type} | ${desc} |\n`;
          });

          return md + '\n';
        };

        return context;
      };
    }
  });
};
