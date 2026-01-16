const { getTag, getTagContent } = require('../utils/tags');

exports.patchMemberContainer = (context) => {
  const original = context.partials.memberContainer;
  
  context.partials.memberContainer = function (model, options) {
    let md = original.call(context, model, options);

    const restTag = getTag(model, '@rest');
    const sinceTag = getTag(model, '@since');

    md = md.replace(/(###+ )(\w+)\(\)\n\n> \*\*\2\*\*\(([^)]+)\): (.+?)\n\n([^\n]+)/gs, 
      (match, hashes, name, params, returnType, description) => {
        let result = `${hashes}.${name}(\`${params}\`): \`${returnType}\``;
        
        if (sinceTag) {
          const version = getTagContent(sinceTag);
          result += ` <span class="api-since-badge"><img src="/icons/since.svg" alt="Since" />${version}</span>`;
        }
        
        result += '\n\n';
        
        if (restTag) {
          const [method, path, link] = getTagContent(restTag).split(/\s+/);
          if (method && path) {
            const fullLink = link && !link.startsWith('http') 
              ? `https://docs.yurba.one/${link.replace(/^\//, '')}` 
              : link;
            
            const iconSrc = fullLink ? '/icons/link.svg' : '/icons/link-slash.svg';
            const iconHtml = fullLink
              ? `<a href="${fullLink}" target="_blank" class="api-link-icon"><img src="${iconSrc}" alt="API Docs" /></a>`
              : `<span class="api-link-icon no-link"><img src="${iconSrc}" alt="No API Docs" /></span>`;

            result += `<div class="api-info"><span class="api-badge api-badge-${method.toLowerCase()}">${method}</span> <span class="api-path" title="Click to copy" data-copy-text="${path}">${path}</span> ${iconHtml}</div>\n\n`;
          }
        }
        
        result += `> <div class="api-description">${description}</div>`;
        return result;
      }
    );

    return md;
  };
};
