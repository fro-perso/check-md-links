function indentationWidth(line) {
  let width = 0;

  for (const character of line) {
    if (character === ' ') {
      width += 1;
    } else if (character === '\t') {
      width += 4 - (width % 4);
    } else {
      break;
    }
  }

  return width;
}

function openingFence(line) {
  const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  if (!match || (match[1][0] === '`' && match[2].includes('`'))) return null;

  return { character: match[1][0], length: match[1].length };
}

function withoutBlockCode(markdown) {
  const lines = markdown.split(/\r?\n/);
  let fence = null;
  let indentedCode = false;
  let paragraphOpen = false;

  return lines.map((line) => {
    if (fence) {
      const closing = line.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (closing && closing[1][0] === fence.character && closing[1].length >= fence.length) {
        fence = null;
      }
      return '';
    }

    if (indentedCode) {
      if (/^[ \t]*$/.test(line) || indentationWidth(line) >= 4) return '';
      indentedCode = false;
    }

    if (/^[ \t]*$/.test(line)) {
      paragraphOpen = false;
      return line;
    }

    const opening = openingFence(line);
    if (opening) {
      fence = opening;
      paragraphOpen = false;
      return '';
    }

    // An indented code block cannot interrupt a paragraph in Markdown.
    if (!paragraphOpen && indentationWidth(line) >= 4) {
      indentedCode = true;
      return '';
    }

    paragraphOpen = true;
    return line;
  }).join('\n');
}

function withoutCodeSpans(markdown) {
  const runs = [...markdown.matchAll(/`+/g)];
  const nextRunWithLength = new Map();
  const closingRunIndexes = new Array(runs.length).fill(-1);

  for (let index = runs.length - 1; index >= 0; index -= 1) {
    const length = runs[index][0].length;
    closingRunIndexes[index] = nextRunWithLength.get(length) ?? -1;
    nextRunWithLength.set(length, index);
  }

  let result = '';
  let cursor = 0;

  for (let index = 0; index < runs.length;) {
    const closingIndex = closingRunIndexes[index];

    if (closingIndex === -1) {
      index += 1;
      continue;
    }

    const start = runs[index].index;
    const end = runs[closingIndex].index + runs[closingIndex][0].length;
    result += markdown.slice(cursor, start);
    result += markdown.slice(start, end).replace(/[^\r\n]/g, ' ');
    cursor = end;
    index = closingIndex + 1;
  }

  return result + markdown.slice(cursor);
}

function withoutCode(markdown) {
  const content = withoutBlockCode(markdown);

  // Code spans may contain line endings, but a blank line ends their paragraph.
  return content
    .split(/(\r?\n[ \t]*\r?\n)/)
    .map((part, index) => (index % 2 === 0 ? withoutCodeSpans(part) : part))
    .join('');
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
