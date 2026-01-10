import type MarkdownIt from 'markdown-it';

export function apiLinksPlugin(md: MarkdownIt) {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');
    
    if (hrefIndex >= 0) {
      const href = token.attrs[hrefIndex][1];
      if (href.match(/\/(interfaces|classes|type-aliases)\/.*\.md$/)) {
        const textToken = tokens[idx + 1];
        if (textToken?.type === 'text') {
          const name = textToken.content;
          const htmlHref = href.replace('.md', '.html');
          textToken.content = '';
          return `<ApiLink href="${htmlHref}" name="${name}">${name}`;
        }
      }
    }
    
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_close = (tokens, idx) => {
    const openToken = tokens[idx - 2];
    if (openToken?.type === 'link_open') {
      const hrefIndex = openToken.attrIndex('href');
      if (hrefIndex >= 0 && openToken.attrs[hrefIndex][1].match(/\/(interfaces|classes|type-aliases)\/.*\.md$/)) {
        return '</ApiLink>';
      }
    }
    return '</a>';
  };
}
