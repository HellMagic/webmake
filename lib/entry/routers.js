const {existsSync, readFileSync} = require('fs');
const {resolve, relative, dirname} = require('path');
const cheerio = require('cheerio');
const glob = require('glob');
const {pathConfig, projectConfig} = require('./commonProjectConfig');

const extraData = existsSync(pathConfig.extra) ? require(pathConfig.extra) : {};
const routers = glob.sync(`${pathConfig.pages}/**/index.vue`);
const entry = {};
const pagesConfig = [];

const getTdk = rawText => {
    let $ = cheerio.load(rawText, {decodeEntities: false});
    $ = cheerio.load($('template').html(), {decodeEntities: false});

    let layout = '';
    const title = $('title').text();
    const metas = [];
    const style = [];
    const script = [];

    $('meta').each(function () {
        const attrs = $(this).attr();
        switch (attrs.name) {
            case 'layout': {
                layout = resolve(pathConfig.root, attrs.content);

                break;
            }

            case 'extra:style': {
                style.push(attrs.content);

                break;
            }

            case 'extra:script': {
                script.push(attrs.content);

                break;
            }

            default: {
                metas.push(attrs);
            }
        }
    });
    return {layout, title, metas, style, script};
};

for (const v of routers) {
    const entryKey = dirname(relative(pathConfig.pages, v));
    const entryValue = resolve(pathConfig.tpl, entryKey, 'index.js');
    entry[entryKey] = entryValue;
    pagesConfig.push({
        vuePath: v,
        outputPath: entryKey,
        entryPath: entryValue,
        extra: Object.assign(
            {
                title: projectConfig.title,
                layout: '',
                metas: [],
            },
            extraData[entryKey],
        ),
    });
}

// Title layout metas -- 解析 vue template 中的 meta，包括 script、style 等，这些内容
for (const v of pagesConfig) {
    const {vuePath} = v;
    const content = readFileSync(vuePath).toString();
    const templateContent = content.match(/<template>(\n|.)+<\/template>/);

    if (!templateContent) {
        continue;
    }

    const {layout, title, metas, style, script} = getTdk(templateContent[0]);

    if (layout) {
        v.extra.layout = layout;
    }

    if (title) {
        v.extra.title = title;
    }

    v.extra.metas = metas;
    if (style.length > 0) {
        if (v.extra.css) {
            if (Array.isArray(v.extra.css)) {
                v.extra.css.push(...style);
            } else {
                v.extra.css = [v.extra.css, ...style];
            }
        } else {
            v.extra.css = style;
        }
    }

    if (script.length > 0) {
        if (v.extra.script) {
            if (Array.isArray(v.extra.script)) {
                v.extra.script.push(...script);
            } else {
                v.extra.script = [v.extra.script, ...script];
            }
        } else {
            v.extra.script = script;
        }
    }
}

module.exports = {entry, pagesConfig};
