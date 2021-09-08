const {isAbsolute, resolve} = require('path');

const {NODE_ENV} = process.env;
const rootPath = process.cwd();
const temporaryPath = resolve(rootPath, '.temp');
const [isDevelopment, isProduction] = [NODE_ENV === 'development', NODE_ENV === 'production'];

let projectConfig = require(`${rootPath}/project.config.js`);
const thriftConfig = require(`${rootPath}/thrift.config`);
const s3Config = require(`${rootPath}/s3plus.config.js`);
const serverConfig = require(`${rootPath}/server/config`);

// Thrift升级: 去掉 port, 增加 filterByServiceName: true
// https://km.sankuai.com/page/163555558
for (const [i, v] of thriftConfig.maven.entries()) {
    for (const v2 of Object.keys(v.services || {})) {
        delete thriftConfig.maven[i].services[v2].port;
        thriftConfig.maven[i].services[v2].filterByServiceName = true;
    }
}

// 判断变量从而重置publicPath
if (process.env.MSS_APP_KEY && process.env.MSS_APP_SECRET && s3Config) {
    const {s3plusHost, tenantId, bucket, customPath} = s3Config;
    projectConfig.publicPath = `https://${s3plusHost}/v1/mss_${tenantId}/${bucket}/${customPath}`;
} else if (process.env.BUILD_SERVICE === 'true' && process.env.BUILD_SERVICE_PATH) {
    projectConfig.publicPath = `https://s0.meituan.net/bs/${process.env.BUILD_SERVICE_PATH}/file/static`;
}

if (!projectConfig.title || projectConfig.title === '芥末系统') {
    projectConfig.title = '买菜零售系统';
}

if (!('enableMetaViewport' in projectConfig)) {
    projectConfig.enableMetaViewport = true; // 是否添加 viewport meta标签 默认值跟之前保持一致
}

const noop = () => {};

// 修复bug webpack.IgnorePlugin moment/locale
projectConfig.fixMomentjsLocale = projectConfig.fixMomentjsLocale || false;

projectConfig = Object.assign(
    {
        // FIXME: hard code
        favicon: 'https://s3plus.meituan.net/v1/mss_915cfe67c99b4651b81ca210670f9302/mall-fe-files/favicon.ico',
        vuexConfig: {
            storeRoot: 'pages',
            storeMap: {},
        },
        loaders: [],
        enableCat: !('enableCat' in serverConfig) ? true : serverConfig.enableCat, // eslint-disable-line no-negated-condition
        provide: {},
        copyAssets: null,
        alias: {},
        entryTemplate: noop,
        printRouter: true,

        // 是否使用平台
        usePlatform: 0, // 1 远程模版方式, 2 远程仓库方式，3 本地模版方式
        // 是否使用本地平台模版
        remoteLayoutGitRepo: 'ssh://git@git.sankuai.com/octopus/mall-fe-pc.git',
        remoteLayoutGitBranch: 'master',
        remoteLayoutPath: 'src/components/MainLayout/index.vue',
        remoteTemplateFileUrl: 'https://msstest.sankuai.com/v1/mss_8e5e7da6ddb247169216728b9ff41835/dev/mall-fe-pc/master/index.html',
    },
    projectConfig,
);

const pathConfig = Object.assign(
    {
        root: rootPath,
        NODE_CONFIG_DIR: resolve(rootPath, 'server/config'),
        src: resolve(rootPath, 'src'),
        global: resolve(rootPath, 'src/global.js'),
        pages: resolve(rootPath, 'src/pages'),
        nodeModulePath: resolve(rootPath, 'node_modules'),
        build: resolve(rootPath, 'static'),

        // 远程模版模版目录
        layoutDir: resolve(temporaryPath, 'layout'),
        // 本地模版目录
        localLayoutPath: '',

        temp: temporaryPath,
        BundleAnalyzer: resolve(temporaryPath, 'BundleAnalyzer'),
        dll: resolve(temporaryPath, 'dll'),
        tpl: resolve(temporaryPath, 'tpl'),
        asset: resolve(temporaryPath, 'asset'),

        thriftSourceDir: resolve(rootPath, 'docs/thrift'),
        thriftTargetDir: resolve(temporaryPath, 'thriftLibs'),
        thriftApiDir: resolve(temporaryPath, 'thriftApi'),
        thriftMap: resolve(temporaryPath, 'thriftMap.js'),

        extra: resolve(rootPath, 'src/extra.js'),
        lxConfig: resolve(rootPath, 'lx.config.js'),

        buildTemplate: '',
        webpackConfig: '',

    },
    projectConfig.pathConfig,
);

pathConfig.thriftArgsPath = resolve(rootPath, 'docs/thriftApiArgsType');
// 移除：pathConfig.dllVersion = resolve(pathConfig.dll, 'version.json');

for (const item of Object.entries(pathConfig)) {
    const [key, value] = item;
    if (value && !isAbsolute(value)) {
        pathConfig[key] = resolve(rootPath, value);
    }
}

module.exports = {
    projectConfig,
    serverConfig,
    thriftConfig,
    pathConfig,

    NODE_ENV,
    isDevelopment,
    isProduction,

};
