const { range, getRandomInt, getOneAndInsert } = require('./helper.js');
const config                                   = require('../config/config.json')
const fs                                       = require('fs');
const UserAgent                                = require('user-agents')
const path                                     = require('path');
const puppeteer                                = require('puppeteer');
const proxyChain                               = require('proxy-chain');

var socks5 = range(config.proxyInfo.port.start, config.proxyInfo.port.end)

async function connectSocks5(userDataDir) {
    port = socks5[0]
    socks5 = getOneAndInsert(socks5)
    userAgent = new UserAgent();

    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true })
    }

    let prefs = await config.prefs.join('\n')

    let host = config.proxyInfo.host
    prefs +=
        `\n
user_pref("network.proxy.socks", "${host}");
user_pref("network.proxy.socks_port", ${port});
user_pref("network.proxy.type", 1);
user_pref("general.useragent.override",${userAgent.userAgent});`

    await fs.writeFile(path.join(userDataDir, './prefs.js'), prefs, () => { });
}

async function connectHTTPAuth(userDataDir) {
    port = getRandomInt(config.proxyInfo.port.start, config.proxyInfo.port.end);

    PROXY_SERVER_CONNECTION_WITH_AUTH = `http://${config.proxyInfo.user}:${config.proxyInfo.pass}@${config.proxyInfo.host}:${port}`;

    const proxyServerURL = await proxyChain.anonymizeProxy(PROXY_SERVER_CONNECTION_WITH_AUTH)


    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true })
    }

    let prefs = await config.prefs.join('\n')

    if (proxyServerURL) {
        let [host, port] = proxyServerURL.replace(/https?:\/\//g, '').split(':')
        prefs += 
            `\nuser_pref("network.proxy.ftp", "${host}");
user_pref("network.proxy.ftp_port", ${port});
user_pref("network.proxy.http", "${host}");
user_pref("network.proxy.http_port", ${port});
user_pref("network.proxy.share_proxy_settings", true);
user_pref("network.proxy.socks", "${host}");
user_pref("network.proxy.socks_port", ${port});
user_pref("network.proxy.ssl", "${host}");
user_pref("network.proxy.ssl_port", ${port});
user_pref("network.proxy.type", 1);`
    }

    await fs.writeFile(path.join(userDataDir, './prefs.js'), prefs, () => { });

    return proxyServerURL
};

async function lauchFirefox(site) {
    const profileName = `${Math.floor(Date.now() / 1000)}`;
    const userDataDir = `./firefox_profiles/${profileName}`

    switch (config.proxyType) {
        case 'socks5':
            await connectSocks5(userDataDir)
        case 'httpauth':
            var proxyServerURL = await connectHTTPAuth(userDataDir)
        default:
            let prefs = await config.prefs.join('\n')
            await fs.writeFile(path.join(userDataDir, './prefs.js'), prefs, () => { });
    }

    const options = {
        product: 'firefox',
        headless: false,
        defaultViewport: null,
        //executablePath: './firefox/firefox.exe',
        userDataDir: userDataDir,
        args: [
            "--disable-web-security",
        ],

    }
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.goto(site)

    return { page, browser, proxyServerURL }
}

module.exports = {
    lauchFirefox: lauchFirefox
}
