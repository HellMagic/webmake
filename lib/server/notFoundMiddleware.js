const fs = require('fs');
const path = require('path');

const notFoundPagePath = path.resolve(__dirname, './pages/404.html');

module.exports = function (request, response) {
    // 区分是否是 api 请求
    response.status(404);
    if (request.accepts('html')) {
        const content = fs.readFileSync(notFoundPagePath, {encoding: 'utf-8'});
        response.set({'Content-Type': 'text/html'}).end(content);
    } else {
        response.json({code: -1, msg: `not found api ${request.url}`});
    }
};

