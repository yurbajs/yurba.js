exports.patchComment = (context) => {
  const original = context.partials.comment;
  
  context.partials.comment = function (comment, options) {
    if (comment?.blockTags) {
      const filteredBlockTags = comment.blockTags.filter(tag => 
        tag.tag !== '@rest' && tag.tag !== '@since'
      );
      const originalBlockTags = comment.blockTags;

      comment.blockTags = filteredBlockTags;
      const md = original.call(context, comment, options);
      comment.blockTags = originalBlockTags;
      
      return md;
    }
    return original.call(context, comment, options);
  };
};
