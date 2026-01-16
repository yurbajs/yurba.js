const { ReflectionKind } = require('typedoc');

exports.patchReflection = (context) => {
  const original = context.templates.reflection;
  
  context.templates.reflection = function (page) {
    let md = original.call(context, page);
    const model = page.model;

    if (
      (model.kind === ReflectionKind.Class || model.kind === ReflectionKind.Interface) &&
      model.typeHierarchy?.next
    ) {
      const extendsTypes = model.typeHierarchy.types.map((t) => {
        if (t.reflection) {
          return `[${t.reflection.name}](${context.urlTo(t.reflection)})`;
        }
        return context.helpers.getHierarchyType(t, { isTarget: false });
      });

      if (extendsTypes.length > 0) {
        const extendsBlock = `> Extends: ${extendsTypes.join(', ')}`;
        md = md.replace(/^(# (?:Class|Interface): .*)$/m, `$1\n${extendsBlock}`);
      }
    }
    return md;
  };
};
