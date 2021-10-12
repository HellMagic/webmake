const path = require('path');
const fs = require('fs');
const projectRootDir = process.cwd();
const configDir = path.resolve(projectRootDir, 'config/');
const _ = require('lodash');

const result = {
    projectPathConfig: {
        path: projectRootDir,
        configDir: {
            path: configDir,
            apiProxyConfigFile: path.resolve(configDir, 'apiProxyConfig.js')
        }
        
    }
}

function autoCheckNecessary() {
    const list = ['projectPathConfig.configDir.apiProxyConfigFile'];
    list.forEach(item => {
        const checkItem = _.get(result, item);
        if (!fs.existsSync(checkItem)) throw new Error(`必要的文件或目录不存在，path: ${checkItem}`);
    });
}

autoCheckNecessary();
module.exports = result;