// 读取 server/config/development.js 代理其中的 api 请求
// TODO: 从当前分支名字中获取到 ones id --> 泳道名称，同时支持配置
const {createServer: createViteServer} = require('vite');
const {projectPathConfig: {configDir: {apiProxyConfigFile}}} = require('../util/configManager');

module.exports = async function () {
    const apiProxyConfig = require(apiProxyConfigFile);
    injectHostHeader(apiProxyConfig);

    const vite = await createViteServer({
        server: {middlewareMode: 'ssr',
            // 参考配置：https://vitejs.bootcss.com/config/#server-proxy
            proxy: apiProxyConfig,
        },
    });

    return vite.middlewares;
};

/**
 * Return null; 直接修改原对象
 * @param {Vite Server Proxy Config} apiProxyConfig 需要执行的代理配置
 */
function injectHostHeader(apiProxyConfig) {
    for (const item of Object.values(apiProxyConfig)) {
        if (Boolean(item.target) && typeof item.target === 'string') {
            const matchResult = item.target.match(/^https?:\/\/([\w.-]+)\/?/);
            if (!matchResult || !matchResult[1]) {
                throw new Error(`从 apiProxyConfig 的 target 解析 Host 失败：target: ${item.target}`);
            }

            item.headers = {
                Host: matchResult[1],
            };
        }
    }
}
