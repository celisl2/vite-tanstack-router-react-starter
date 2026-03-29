// @ts-check

/** @type {import('prettier').Config} */
const config = {
  // Line length before Prettier wraps. 100 is the modern sweet spot —
  // 80 is too narrow for TypeScript generics, 120 stretches readability.
  printWidth: 100,

  // 2-space indent is the React/TypeScript community standard.
  tabWidth: 2,
  useTabs: false,

  // No semicolons — ASI handles this correctly in modern JS/TS, and it
  // reduces visual noise. Matches the existing project style.
  semi: false,

  // Single quotes for JS/TS strings. JSX attributes still use double quotes
  // (jsxSingleQuote: false below) to match HTML conventions.
  singleQuote: true,
  jsxSingleQuote: false,

  // Trailing commas in all multi-line structures — makes diffs cleaner
  // since adding/removing the last item doesn't touch the previous line.
  trailingComma: 'all',

  // Spaces inside object braces: { foo: bar } not {foo: bar}.
  bracketSpacing: true,

  // Put the closing > of a JSX element on its own line when it wraps.
  // Keeps props and closing bracket visually separated.
  bracketSameLine: false,

  // Always include parens around arrow function args: (x) => x not x => x.
  // Consistent and easier to add types or destructure later.
  arrowParens: 'always',

  // Unix line endings across all platforms. Prevents Windows CRLF
  // from showing up in diffs on cross-platform teams.
  endOfLine: 'lf',

  // Preserve quotes in JSX attributes rather than normalising them —
  // lets you use the quote style that avoids escaping.
  singleAttributePerLine: false,

  // Format embedded code blocks (e.g. CSS-in-JS template literals, GraphQL).
  embeddedLanguageFormatting: 'auto',
}

export default config
