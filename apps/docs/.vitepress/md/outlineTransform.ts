import type MarkdownIt from 'markdown-it';

export function outlineTransformPlugin(md: MarkdownIt) {
  const originalHeadingOpen = md.renderer.rules.heading_open;
  
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const nextToken = tokens[idx + 1];
    
    if (nextToken && nextToken.type === 'inline' && nextToken.content) {
      // Check if this is a method heading (contains parentheses)
      const match = nextToken.content.match(/^\.?(\w+)\([^)]*\)/);
      if (match) {
        const methodName = match[1];
        // Store simplified version for outline
        if (!token.attrGet('data-outline')) {
          token.attrSet('data-outline', `.${methodName}`);
        }
      }
    }
    
    return originalHeadingOpen ? originalHeadingOpen(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
  };
}
