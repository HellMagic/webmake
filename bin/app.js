#! /usr/bin/env node

const createServer = require('../lib/server/index');

const [command] = process.argv.slice(2);

switch (command) {
    case 'serve':
        createServer();
        break;
    default:
        console.log(`未能匹配到命令：${command}`);
}
