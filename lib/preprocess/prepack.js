const {writeFileSync} = require('fs');
const {ensureFileSync, ensureDirSync} = require('fs-extra');
const {relative, join} = require('path');
const url = require('url');
const chalk = require('chalk');

const {isDevelopment, pathConfig, projectConfig, serverConfig} = require('./commonProjectConfig');
const {pagesConfig} = require('./routers');
// Const getDllVersion = require('./getDllVersion');
const getFormatCode = require('../util/formatCode');

// 打印带颜色的信息
const log = (string_, color) => console.log(color ? chalk[color](string_) : string_);

const genHookCode = eventName => `if (window.$xxEE) { try { window.$xxEE.emit('${eventName}'); } catch(err) { console.error('${eventName}', err) } }`;

const vueTemplate = AppPath => {
    const globalPath = join('__src', relative(pathConfig.src, pathConfig.global));
    if (projectConfig.entryTemplate()) {
        const template = projectConfig.entryTemplate(AppPath);
        return [`import '${globalPath}';`, ...(Array.isArray(template) ? template : template.split('\n'))].join('\n');
    }

    return [
        'import Vue from \'vue\';',
        `import '${globalPath}';`,
        `import App from '${AppPath}';`,
        'window.Vue = Vue;',
        genHookCode('app:before-render'),
        'new Vue({',
        '    el: \'#app\',',
        '    render: h => h(App)',
        '});',
        genHookCode('app:after-render'),
    ].join('\n');
};

const vuexTemplate = (AppPath, storePath) => {
    const globalPath = join('__src', relative(pathConfig.src, pathConfig.global));
    if (projectConfig.entryTemplate()) {
        const template = projectConfig.entryTemplate(AppPath, storePath);
        return [`import '${globalPath}';`, ...(Array.isArray(template) ? template : template.split('\n'))].join('\n');
    }

    return [
        'import Vue from \'vue\';',
        `import '${globalPath}';`,
        `import App from '${AppPath}';`,
        `import store from '${storePath}';`,
        'window.Vue = Vue;',
        genHookCode('app:before-render'),
        'new Vue({',
        '    el: \'#app\',',
        '    store,',
        '    render: h => h(App)',
        '});',
        genHookCode('app:after-render'),
    ].join('\n');
};

const printRouter = () => {
    if (isDevelopment && projectConfig.printRouter) {
        log('路由列表:', 'cyan');
        log('-'.repeat(30), 'cyan');
        for (const v of pagesConfig) {
            const {outputPath} = v;
            if (outputPath !== 'index') {
                const pathname = `${(projectConfig.urlPrefix || '').replace('-alias', '')}/${outputPath}.html`;
                const completeUrl = url.format({
                    protocol: 'http',
                    hostname: 'localhost',
                    port: serverConfig.port,
                    pathname,
                });
                log(completeUrl);
            }
        }

        log('-'.repeat(30), 'cyan');
    }
};

const produceVueTemplateJs = () => {
    ensureDirSync(pathConfig.tpl);
    const {vuexConfig} = projectConfig;
    for (const v of pagesConfig) {
        const {vuePath, entryPath} = v;
        ensureFileSync(entryPath);
        let text = '';
        let storePath = vuexConfig.storeMap[v.outputPath];
        if (storePath) {
            if (vuexConfig.storeRoot) {
                storePath = join(vuexConfig.storeRoot, storePath);
            }

            text = vuexTemplate(relative(pathConfig.src, vuePath), storePath);
        } else {
            text = vueTemplate(relative(pathConfig.src, vuePath));
        }

        text = getFormatCode(text);
        writeFileSync(entryPath, text);
    }
};

module.exports = () => {
    produceVueTemplateJs();
    printRouter();
};
