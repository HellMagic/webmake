/**
 * Dev server 的所有系统的 html 请求都走 render：pc 的页面直接读取 local pc file，sub system 的页面则走 pug 模板 render。但能否响应请求需要对请求做 “合规” 校验。
 *
 */

const path = require('path');
const fs = require('fs-extra');

const projectRoot = process.cwd();
const pagesDir = path.resolve(projectRoot, 'app/pages');

const temporaryDir = path.resolve(projectRoot, '.temp');
const viteAssetHtmlDir = path.resolve(temporaryDir, 'vite/assets/html');
// vite 默认 public 目录是 <root>/public，但可以通过 publicDir 选项 来配置。
const defaultPublicDir = path.resolve(projectRoot, 'public');

const pcIndexFileName = 'index.html';

// 暂时先直接使用 public 目录，后面可以通过设置 publicDir 修改为 .temp。
// const localPcFilePath = path.resolve(viteAssetHtmlDir, pcIndexFileName);
const localPcFilePath = path.resolve(defaultPublicDir, `pc/${pcIndexFileName}`);

module.exports = async function (request, response, next) {
    const url = request.originalUrl;

    // 如果不是 html 请求 且 不是 / 路径，则交给下个 middleware 处理
    if (!url.endsWith('.html') && url !== '/') {
        return next();
    }

    const renderInfo = getRenderInfo(url);
    if (!renderInfo) {
        return next();
    }

    const {type: renderType, subPath} = renderInfo;

    switch (renderType) {
        case 'pc':
            renderPc(response);
            break;
        case 'sub':
            renderSub(response, subPath);
            break;
        default:
            next();
    }
};

function renderPc(response) {
    const content = fs.readFileSync(localPcFilePath, {encoding: 'utf-8'});
    response.status(200).set({'Content-Type': 'text/html'}).end(content);
}

function renderSub(response, subPath) {
    const entryScript = getEntryScript(subPath);
    response.render('sub', {entryScript});
}

/**
 * 根据请求的 url 是否能标识一个页面，如果请求 url 能标识一个 芥末 页面代码组织结构路径，那么根据 projectFlag 是否带有 -alias 标识来确定返回 pc 页面还是 子页面。
 * @param {String} url 当前请求的 url
 * @returns 需要 render 的类型，当前只支持 pc/sub
 */
function getRenderInfo(url) {
    // 只要不是 -alias 模式的请求 则返回 pc
    // /product/newSell/approve/list.html
    if (url === '/') {
        return {type: 'pc'};
    } // LocalPcFilePath

    // 匹配到 /<projectName>/<...subPath> 模式，而且这里匹配模式需要改一下？新加 /maicai 前缀
    const subUrlMatch = url.match(/^(?:\/maicai)?\/([-\w]+)\/([-/\w]+)\.html$/);
    if (!subUrlMatch) {
        return;
    }

    const [, projectFlag, subPath] = subUrlMatch;
    const expectPagePath = path.resolve(projectRoot, pagesDir, subPath, 'index.vue');

    return fs.existsSync(expectPagePath) ? (projectFlag.endsWith('-alias') ? {type: 'sub', subPath} : {type: 'pc'}) : null;
}

/**
 * 相当于 main.js
 * @returns 需要插入的 js 脚本
 */
function getEntryScript(subPath) {
    // 这里的 path 都是以 空 前缀 开头的相对路径（既不是以 / 开头，也不是以 . 开头），相对 项目根目录的路径。
    // src/global.js  src/pages/a/b/c/index.vue
    const globalPath = '/app/global.js';
    const appPath = `/app/pages/${subPath}/index.vue`;
    const result = `
        import '${globalPath}'
        import App from '${appPath}';
        
        if (window.$xxEE) {
            try {
                window.$xxEE.emit('app:before-render');
            } catch (err) {
                console.error('app:before-render', err);
            }
        }

        new Vue({
            el: '#app',
            render: h => h(App)
        });

        if (window.$xxEE) {
            try {
                window.$xxEE.emit('app:after-render');
            } catch (err) {
                console.error('app:after-render', err);
            }
        }    

    `;
    return result;
}

