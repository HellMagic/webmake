const pug = require('pug');
const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');
const vite = require('vite');
const _ = require('lodash');
// const {pagesConfig, entry} = require('./routers');
const {projectPathConfig: {pagesDir, temporaryHtmlDir, viteOutBuildDir, viteOutBuildHtmlDir, viteBaseConfigFile}} = require('../lib/util/configManager');

const subTemplatePath = path.resolve(__dirname, '../lib/server/template/sub.pug');
const viteBaseConfig = require(viteBaseConfigFile);

/**
 * 相当于 main.js
 * @returns 需要插入的 js 脚本
 */
 function getEntryScript(subPath) {
    // 这里的 path 都是以 空 前缀 开头的相对路径（既不是以 / 开头，也不是以 . 开头），相对 项目根目录的路径。
    // src/global.js  src/pages/a/b/c/index.vue
    const globalPath = '/app/global.js';
    const appPath = `/app/pages/${subPath}`;
    const result = `
        import createApp from '${globalPath}';
        import App from '${appPath}';
        
        createApp(App);

    `;
    return result;
}

/**
 * 按照标准应用结构生成所有 entry htmls(副作用)，返回所有生成 html 文件路径的数组
 */
function genEntryPageHtmls() {
// 去掉 <script type="module" src="/@vite/client"></script> ？？？
    // const result = {};
    const pageVuefielExt = '/index.vue';
    const allPageFilePath = glob.sync(`${pagesDir}/**${pageVuefielExt}`).map(item => path.relative(pagesDir, item));
    return allPageFilePath.map(item => {
        const entryScript = getEntryScript(item);
        const rawHtmlString = pug.renderFile(subTemplatePath, {entryScript});
        // 先 ensure，再 write
        const tempHtmlFilePath = path.resolve(`${temporaryHtmlDir}`, `${item.slice(0, -(pageVuefielExt.length))}.html`);
        fs.ensureFileSync(tempHtmlFilePath);
        fs.writeFileSync(tempHtmlFilePath, rawHtmlString);
        return tempHtmlFilePath;
    });
}


module.exports = async function build() {
    const allEntryHtml = genEntryPageHtmls();
    _.set(viteBaseConfig, 'build.rollupOptions.input', allEntryHtml);
    await vite.build(viteBaseConfig);
    console.log('done');
    fs.copySync(viteOutBuildHtmlDir, viteOutBuildDir);
    fs.removeSync(viteOutBuildHtmlDir);
}

