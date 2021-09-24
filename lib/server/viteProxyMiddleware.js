// 读取 server/config/development.js 代理其中的 api 请求
// TODO: 从当前分支名字中获取到 ones id --> 泳道名称，同时支持配置
const {createServer: createViteServer} = require('vite');

module.exports = async function () {
    const vite = await createViteServer({
        server: {middlewareMode: 'ssr',
            proxy: {
                '/api': {
                    target: 'http://localhost:4000',
                    rewrite: path => `${path}/hello`,
                },
            },
        },
    });

    return vite.middlewares;
};

