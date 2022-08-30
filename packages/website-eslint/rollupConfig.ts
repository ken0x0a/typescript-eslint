import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

import { aliasPlugin } from './rollup-plugin/alias';
import { replacePlugin } from './rollup-plugin/replace';

export = {
  input: 'src/linter/linter.js',
  output: {
    format: 'amd',
    interop: 'auto',
    freeze: false,
    sourcemap: true,
    file: 'dist/index.js',
  },
  external: ['vs/language/typescript/tsWorker'],
  plugins: [
    aliasPlugin([
      {
        // those files should be omitted, we do not want them to be exposed to web
        match: [
          /eslint\/lib\/(rule-tester|eslint|cli-engine|init)\//u,
          /eslint\/lib\/cli\.js$/,
          /utils\/dist\/eslint-utils\/RuleTester\.js$/,
          /utils\/dist\/ts-eslint\/CLIEngine\.js$/,
          /utils\/dist\/ts-eslint\/RuleTester\.js$/,
          /typescript-estree\/dist\/create-program\/createWatchProgram\.js/,
          /typescript-estree\/dist\/create-program\/createProjectProgram\.js/,
          /typescript-estree\/dist\/create-program\/createIsolatedProgram\.js/,
          /utils\/dist\/ts-eslint\/ESLint\.js/,
          // 'eslint/lib/shared/ajv.js',
          // 'eslint/lib/shared/runtime-info.js',
          /ajv\/lib\/definition_schema\.js/,
          /stream/,
          /os/,
          /fs/,
        ],
        target: './src/mock/empty.js',
      },

      // use window.ts instead of bundling typescript
      {
        match: /typescript$/u,
        target: './src/mock/typescript.js',
      },

      // semver simplified, solve issue with circular dependencies
      {
        match: /semver$/u,
        target: './src/mock/semver.js',
      },

      // custom stubs / polyfills
      {
        match: /^assert$/u,
        target: './src/mock/assert.js',
      },
      {
        match: /^path$/u,
        target: './src/mock/path.js',
      },
      {
        match: /^util$/u,
        target: './src/mock/util.js',
      },
      {
        match: /^globby$/u,
        target: './src/mock/globby.js',
      },
      {
        match: /^is-glob$/u,
        target: './src/mock/is-glob.js',
      },
    ]),
    replacePlugin([
      {
        // replace all process.env.NODE_DEBUG with false
        test: /process\.env\.NODE_DEBUG/u,
        replace: 'false',
      },
      {
        // replace all process.env.TIMING with false
        test: /process\.env\.TIMING/u,
        replace: 'false',
      },
      {
        // replace all process.env.IGNORE_TEST_WIN32 with true
        test: /process\.env\.IGNORE_TEST_WIN32/u,
        replace: 'true',
      },
      {
        // we do not want dynamic imports
        match: /eslint\/lib\/linter\/rules\.js$/u,
        test: /require\(this\._rules\[ruleId\]\)/u,
        replace: 'null',
      },
      {
        // esquery has both browser and node versions, we are bundling browser version that has different export
        test: /esquery\.parse\(/u,
        replace: 'esquery.default.parse(',
      },
      {
        // esquery has both browser and node versions, we are bundling browser version that has different export
        test: /esquery\.matches\(/u,
        replace: 'esquery.default.matches(',
      },
    ]),
    terser({
      keep_classnames: true,
      keep_fnames: true,
      mangle: false,
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json({ preferConst: true }),
  ],
};
