import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteSingleFile } from 'vite-plugin-singlefile'


const { generate: gasEntryGenerator } = require('gas-entry-generator');

function gasPlugin() {
  return {
    name: 'gas-plugin',
    transform(code, id) {
      // Check if file is a JavaScript file
      if (id.endsWith('.js')) {
        // Add comment to beginning of code
        const transformedCode = `console.log("HELLO");\n${code}`;

        // Return the transformed code
        return {
          // code: transformedCode,
          code: code,
          map: null
        };
      }
    },
    buildEnd() {
      console.log('buildEnd');
    }
  };
};

export default defineConfig({

  plugins: [vue(), vueJsx(), viteSingleFile()],
  root: fileURLToPath(new URL('./', import.meta.url)),
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    minify: false,
    emptyOutDir: false,
    rollupOptions: {
      input: fileURLToPath(new URL('./vue_sidebar.html', import.meta.url)),
      output: {
        dir: fileURLToPath(new URL('../../dist', import.meta.url)),
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/', import.meta.url))
    }
  }
})
