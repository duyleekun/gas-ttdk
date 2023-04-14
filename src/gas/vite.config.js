import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'


const { generate } = require('gas-entry-generator');

function gasPlugin() {
  return {
    name: 'gas-plugin',
    transform(code, id) {
      // Check if file is a JavaScript file
      if (id.endsWith('.js')) {
        const transformedCode = `${generate(code).entryPointFunctions}${code}`;
        // console.log(transformedCode)
        // Return the transformed code
        return {
          code: transformedCode,
          // code: code,
          // code: `//haha\n${code}`,
          map: null
        };
      }
    },
    // moduleParsed(module) {
    //   console.log('moduleParsed', module);
    // },
    // buildEnd() {
    //   console.log('buildEnd', arguments);
    // }
  };
};

export default defineConfig({

  plugins: [viteSingleFile(),gasPlugin()],
  root: fileURLToPath(new URL('./', import.meta.url)),
  build: {
    minify: false,
    emptyOutDir: false,
    rollupOptions: {
      treeshake: false,
      input: fileURLToPath(new URL('./index.js', import.meta.url)),
      output: {
        dir: fileURLToPath(new URL('../../dist', import.meta.url)),
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  }
})
