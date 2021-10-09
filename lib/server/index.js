const path = require('path');
const express = require('express');
const cors = require('cors');

const templateDir = path.resolve(__dirname, 'template');

const authMiddleware = require('./authMiddleware');
const htmlMiddleware = require('./htmlMiddleware');
const rootRouter = require('./routeMiddleware');
const viteProxyMiddleware = require('./viteProxyMiddleware');
const notFoundMiddleware = require('./notFoundMiddleware');
const errorHanlder = require('./errorHandler');
// const makePc = require('./makePc');

async function CreateServer() {
    // TODO: 这个文件有问题。。。？？？
    // await makePc();

    const app = express();
    app.set('views', templateDir);
    app.set('view engine', 'pug');

    app.use(cors());

    // 先经过 登录 验证，才有后续的所有请求
    app.use(authMiddleware);

    // 处理 .html 请求
    app.use(htmlMiddleware);

    // 一定要关注好 root: 默认是 process.cwd()

    // Vite 代理请求：非 html 的静态资源，eg: js/css/img/font...，通过 vite server proxy 代理的其他请求
    app.use(await viteProxyMiddleware());

    // 自定义 api 请求
    app.use(rootRouter);

    // 检查是否是可被代理的请求
    // app.use(apiProxyMiddleware);

    // 不可响应的请求
    app.use(notFoundMiddleware);

    // 错误捕获
    app.use(errorHanlder);

    // 启动服务器
    app.listen(3000, () => console.log('server is running, happy coding~'));
}

module.exports = CreateServer;
// CreateServer();
