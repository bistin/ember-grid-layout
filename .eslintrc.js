module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['ember'],
    extends: ['eslint:recommended', 'plugin:ember/recommended', 'plugin:prettier/recommended'],
    env: {
        browser: true,
    },
    rules: {},
    overrides: [
        // node files
        {
            files: [
                '.eslintrc.js',
                '.template-lintrc.js',
                'ember-cli-build.js',
                'testem.js',
                'blueprints/*/index.js',
                'config/**/*.js',
                'lib/*/index.js',
                'server/**/*.js',
                './index.js',
                'tests/dummy/config/environment.js',
                'tests/dummy/config/targets.js',
            ],
            parserOptions: {
                sourceType: 'script',
            },
            env: {
                browser: false,
                node: true,
            },
        },
    ],
};
