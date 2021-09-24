/**
 *
 *
 */
const path = require('path');

const projectRoot = process.cwd();
const temporaryDir = path.resolve(projectRoot, '.temp');
const viteAssetHtmlDir = path.resolve(temporaryDir, 'vite/assets/html');
const pcIndexFileName = 'pc-index.html';
const localPcFilePath = path.resolve(viteAssetHtmlDir, pcIndexFileName);
const got = require('got');
const fs = require('fs-extra');

fs.ensureFileSync(localPcFilePath);

const remotePcFilePath = 'https://msstest.sankuai.com/v1/mss_8e5e7da6ddb247169216728b9ff41835/host-pc/mall-fe-pc/latest/static/index.html';

module.exports = async function () {
    if (checkIfHaveExist() && !checkIfNeedUpdate()) {
        return;
    }

    await pullFromRemote();
};

// 检查本地是否已经存在 pc 文件
function checkIfHaveExist() {
    return false;
}

// 对比本地和远端 版本是否一致，即远端是否有更新
function checkIfNeedUpdate() {
    return true;
}

// 从远端拉取 pc 文件到本地
async function pullFromRemote() {
    const buffer = await got({
        url: remotePcFilePath,
    }).buffer();

    fs.writeFileSync(localPcFilePath, buffer, {encoding: 'utf-8'});
}

// TODO: 支持本地构建 pc 版本使用
pullFromRemote();
