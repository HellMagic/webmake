const {defineConfig} = require('vite');
const path = require('path');

const projectRoot = process.cwd();
const testHtml = path.resolve(projectRoot, 'temp/demo/index.html');

const isVueNext = false;
const vuePlugin = isVueNext ? require('@vitejs/plugin-vue') : require('vite-plugin-vue2').createVuePlugin;

// https://vitejs.dev/config/
module.exports = defineConfig({
    build: {
        rollupOptions: {
            input: testHtml,
        },
    },
    optimizeDeps: {
        entries: ['vue', 'element-ui'],
    },
    resolve: {
        extensions: ['.js', '.mjs', '.ts', '.vue', '.json', '.jsx', '.tsx'],
    },
    server: {
        open: true,
    },
    plugins: [vuePlugin()],
});
