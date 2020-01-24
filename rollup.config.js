/* jshint node:true */
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

var pkg = require('./package.json');

export default {
  entry: 'src/index.js',
  external: ['underscore'],
  plugins: [
    nodeResolve(),
    commonjs({
      include: ['node_modules/**'],
      namedExports: {
        'es6-promise': ['Promise'],
      },
    }),
  ],
  targets: [
    {
      format: 'es',
      dest: pkg['main'],
    },
  ],
};
