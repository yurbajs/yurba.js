exports.getTag = (model, tagName) => {
  let tag = model.comment?.blockTags?.find(t => t.tag === tagName);
  if (!tag && model.signatures) {
    for (const sig of model.signatures) {
      tag = sig.comment?.blockTags?.find(t => t.tag === tagName);
      if (tag) break;
    }
  }
  return tag;
};

exports.getTagContent = (tag) => {
  return tag?.content.map(c => c.text).join('').trim() || '';
};
