const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const projectRootDir = process.cwd();
const pagesDir = path.resolve(projectRootDir, 'app/pages');
const configDir = path.resolve(projectRootDir, 'config/');

const temporaryDir = path.resolve(projectRootDir, '.temp/');
const temporaryHtmlDir = path.resolve(temporaryDir, 'htmls/');

const defaultPublicDir = path.resolve(projectRootDir, 'public');

// 通过配置项：build.outDir 设置，默认是 dist，这里统一内置（内置的都通过覆盖外部，可以自定义的则覆盖内部）
const viteOutBuildDir = path.resolve(projectRootDir, 'build');
const viteOutBuildHtmlDir = path.resolve(viteOutBuildDir, path.relative(projectRootDir, temporaryHtmlDir));

const viteBaseConfigFile = path.resolve(projectRootDir, 'vite.config.js');

const result = {
    projectPathConfig: {
        path: projectRootDir,
        configDir: {
            path: configDir,
            apiProxyConfigFile: path.resolve(configDir, 'apiProxyConfig.js'),
            // TODO: 准备使用这个 -- vite config 也是一个 project config file，server/build 两个场景都要指定这个自定义的 config 文件路径
            viteBaseConfigFile: path.resolve(configDir, 'vite.config.js')
        },
        viteBaseConfigFile,
        pagesDir,
        defaultPublicDir,
        temporaryDir,
        temporaryHtmlDir,
        viteOutBuildDir,
        viteOutBuildHtmlDir

    },
};

function autoCheckNecessary() {
    const list = ['projectPathConfig.configDir.apiProxyConfigFile'];
    for (const item of list) {
        const checkItem = _.get(result, item);
        if (!fs.existsSync(checkItem)) {
            throw new Error(`必要的文件或目录不存在，path: ${checkItem}`);
        }
    }
}

autoCheckNecessary();
module.exports = result;
