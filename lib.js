function withoutCode(markdown) {
  const lines = markdown.split(/\r?\n/);
  let fence = null;

  return lines.map((line) => {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})/);

    if (fence) {
      if (delimiter && delimiter[1][0] === fence.character && delimiter[1].length >= fence.length) {
        fence = null;
      }
      return '';
    }

    if (delimiter) {
      fence = { character: delimiter[1][0], length: delimiter[1].length };
      return '';
    }

    // Inline code is not Markdown content and may legitimately contain example URLs.
    return line.replace(/(`+)[\s\S]*?\1/g, '');
  }).join('\n');
}

function trimTrailingPunctuation(url) {
  let result = url.replace(/[\],.;:!?]+$/, '');

  // A closing parenthesis belongs to an URL only when it has a matching opening
  // parenthesis inside that URL (for example, Wikipedia article URLs).
  while (result.endsWith(')')) {
    const opening = [...result].filter((character) => character === '(').length;
    const closing = [...result].filter((character) => character === ')').length;
    if (closing <= opening) break;
    result = result.slice(0, -1);
  }

  return result;
}

export function extractUrls(markdown) {
  const content = withoutCode(markdown);
  const matches = content.matchAll(/https?:\/\/[^\s<>"']+/g);

  return [...new Set(
    [...matches]
      .map(([url]) => trimTrailingPunctuation(url))
      .filter(Boolean),
  )];
}
