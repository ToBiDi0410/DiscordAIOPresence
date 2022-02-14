const activityProvider = require("../activityProvider");
const psList = require('@667/ps-list');
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

const provider = new activityProvider("Chrome", 0);

var urlProcessors = {};
var pup;

async function refresh() {
    if (pup == null || !pup.isConnected()) {
        var processes = await psList({ all: true });
        for (const process of processes) {
            if (process.name.includes("chrome")) {
                console.log("[PROVIDER] [CHROME] Chrome found: " + process.pid);
                await connectPuppeteer();
                return await refresh();
            }
        }
    }

    if (pup != null) {
        var pages = await pup.pages();
        for (const page of pages) {
            try {
                if (await page.evaluate(() => { return document.visibilityState == 'visible' })) {
                    page.shown = true;
                } else {
                    page.shown = false;
                }

                page.loadedDate = new Date(await page.evaluate(() => new Date(window.performance.timeOrigin).getTime()));
            } catch (err) {}
        }

        var newActivity = false;
        var activities = [];
        for (const page of pages) {
            for (const [key, value] of Object.entries(urlProcessors)) {
                var val = await value(page);
                if (val != null) {
                    activities.push(val);
                    newActivity = true;
                }
            }
        }

        if (!newActivity) {
            provider.currentActivity = null;
        } else {
            activities.sort(function(a, b) { return b.priorityInt - a.priorityInt });
            provider.currentActivity = activities[0];
        }

    }
}

async function connectPuppeteer() {
    console.log("[PROVIDER] [CHROME] Trying local connection...");
    var res;
    try {
        res = await fetch("http://127.0.0.1:9222/json/version");
        res = await res.json();
    } catch (err) {
        return null;
    }

    console.log("[PROVIDER] [CHROME] Found URL: " + res.webSocketDebuggerUrl);
    pup = await puppeteer.connect({
        browserWSEndpoint: res.webSocketDebuggerUrl,
        ignoreHTTPSErrors: true,
        headless: false,
        defaultViewport: null
    });

    console.log("[PROVIDER] [CHROME] Connected to Chrome");
}

provider.refresh = refresh;

urlProcessors.youtube = require("./chrome_youtube");
urlProcessors.twitch = require("./chrome_twitch");
urlProcessors.iloveradio = require("./chrome_iloveradio");

urlProcessors.XEnd = function(page) { return null; }

module.exports = provider;