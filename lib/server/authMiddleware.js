/**
 * 参考 sso-node-sdk 文档：https://docs.sankuai.com/mt/it/node-sso-sdk/docs/
 *  用户信息：res.locals.userInfo//
 *  client实例对象：res.locals._ssoClient
 *  res.locals.accessToken // 即 ssoid(req.headers.cookie);
 *
 */
const {ExpressSSO: getSsoExpressMiddleware, initLoggerInterceptor, default: getSsoClient} = require('@mtfe/sso-client');

const ssoClient = getSsoClient({
    clientId: 'mall.fe.pc',
    secret: 'd8613751fcd2189ff0e7ddfb0bee6332',
});

initLoggerInterceptor({
    error: () => {}, // 使用源码中的 console.error
    info: () => {}, // 源码注释掉了 console.log
    warn: (message, error) => { // 源码注释掉了 console.warn
        const yellow = '\u001B[93m';
        const gray = '\u001B[0m';
        if (!message.includes('Protocol undefined')) {
            console.warn(yellow, '[WARN]', gray, message, error);
        }
    },
});

module.exports = getSsoExpressMiddleware({
    clientId: 'mall.fe.pc',
    secret: 'd8613751fcd2189ff0e7ddfb0bee6332',
    onRedirectingToOriginalUrl: async (request, response, ssoid) => {
        // Note: hack --> sso sdk 应该这个时候还没有 res.locals.userInfo 也没有 res.locals.accessToken，故需要重新直接 new 一个 SSOClient
        const {data: {login}} = await ssoClient.getUser(ssoid);
        response.cookie('msid', login);
    },
});
