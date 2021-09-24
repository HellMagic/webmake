const express = require('express');

const rootRouter = express.Router(); // eslint-disable-line new-cap

// Sso router
const ssoRouter = express.Router(); // eslint-disable-line new-cap
ssoRouter.get('/logout', async (request, response) => {
    await response.locals._ssoClient.logout(response.locals.accessToken);
    response.redirect('/');
});

ssoRouter.get('/user', (request, response) => {
    response.status(200).json(response.locals.userInfo);
});

// 挂载所有 sub router 到 root router
rootRouter.use('/sso', ssoRouter);

module.exports = rootRouter;
