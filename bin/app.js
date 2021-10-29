#! /usr/bin/env node

const createServer = require('../lib/server/index');
const build = require('../scripts/build');

const [command] = process.argv.slice(2);

switch (command) {
    case 'serve':
        createServer();
        break;
    case 'build':
        build();
        break;
    default:
        console.log(`未能匹配到命令：${command}`);
}
