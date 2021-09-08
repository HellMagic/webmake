const prettier = require('prettier');

const PrettierConfig = {
    parser: 'babel',
    arrowParens: 'avoid',
    bracketSpacing: true,
    insertPragma: false,
    jsxBracketSameLine: false,
    jsxSingleQuote: false,
    printWidth: 160,
    proseWrap: 'never',
    requirePragma: false,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'none',
    useTabs: false,
    overrides: [
        {
            files: '*.json',
            options: {
                parser: 'json',
                tabWidth: 2,
            },
        },
        {
            files: '*.vue',
            options: {
                parser: 'vue',
            },
        },
        {
            files: '*.{css,scss,less}',
            options: {
                parser: 'css',
                singleQuote: false,
            },
        },
        {
            files: '*.md',
            options: {
                parser: 'markdown',
            },
        },
        {
            files: '*.{yml,yaml}',
            options: {
                parser: 'yaml',
            },
        },
    ],
};

const {parser: defaultParserName, overrides = [], ...defaultOptions} = PrettierConfig;

const prettierOptionsMap = overrides.reduce(
    (previous, cur) => {
        const {parser: parserName, overrideOptions} = cur.options;
        previous[parserName] = {
            ...defaultOptions,
            ...overrideOptions,
        };
        return previous;
    },
    {
        [defaultParserName]: defaultOptions,
    },
);

const getFormatCode = (code = '', parser = defaultParserName) => prettier.format(code, {parser, ...prettierOptionsMap[parser]});

module.exports = getFormatCode;
