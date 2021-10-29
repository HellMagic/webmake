const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const projectRootDir = process.cwd();
const pagesDir = path.resolve(projectRootDir, 'app/pages');
const configDir = path.resolve(projectRootDir, 'config/');
const temporaryDir = path.resolve(projectRootDir, '.temp/');
const defaultPublicDir = path.resolve(projectRootDir, 'public');

const result = {
    projectPathConfig: {
        path: projectRootDir,
        configDir: {
            path: configDir,
            apiProxyConfigFile: path.resolve(configDir, 'apiProxyConfig.js'),
        },
        pagesDir,
        defaultPublicDir,
        temporaryDir,

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
