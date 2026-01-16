exports.patchTypeParametersList = (context) => {
  const original = context.partials.typeParametersList;
  
  context.partials.typeParametersList = function (model, options) {
    if (!model?.length) return '';

    let md = '\n| Name | Type | Description |\n|------|------|-------------|\n';

    model.forEach(param => {
      const name = `\`${param.name}\``;
      const type = param.type ? context.partials.someType(param.type) : '`any`';
      const desc = param.comment?.summary?.map(p => p.text || '').join('').trim() || '';
      md += `| ${name} | ${type} | ${desc} |\n`;
    });

    return md + '\n';
  };
};

exports.patchParametersList = (context) => {
  const original = context.partials.parametersList;
  
  context.partials.parametersList = function (model, options) {
    if (!model?.length) return '';

    let md = '\n| Name | Type | Description |\n|------|------|-------------|\n';

    model.forEach(param => {
      const isOptional = param.flags?.isOptional || param.defaultValue;
      const name = `\`${param.name}${isOptional ? '?' : ''}\``;
      const type = param.type ? context.partials.someType(param.type) : '`any`';
      const desc = param.comment?.summary?.map(p => p.text || '').join('').trim() || '';
      md += `| ${name} | ${type} | ${desc} |\n`;
    });

    return md + '\n';
  };
};

exports.patchHierarchy = (context) => {
  const original = context.partials.hierarchy;
  
  context.partials.hierarchy = function (model, options) {
    if (model && !model.isTarget && model.next) return '';
    return original.call(context, model, options);
  };
};
