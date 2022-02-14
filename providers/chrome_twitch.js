const priorities = require("../priorities");

const TwitchActivityTemplate = {
    assets: {
        large_image: "twitch",
        large_text: "Twitch on Chrome"
    },
    buttons: [{
        "label": "Watch on Twitch",
        "url": "NULL"
    }],
    timestamps: { start: Date.now() },
    instance: true,
};

async function handle(page) {
    if (page.url().includes("twitch.tv") || page.url().includes("twitch.com")) {
        var channelView = await page.evaluate(() => { return document.querySelector(".channel-root") != null; });
        var playing = await page.evaluate(() => { return document.querySelector(".player-overlay-background") == null; });
        var title = await page.evaluate(() => { return document.querySelector("h1") ? document.querySelector("h1").textContent : null; })
        if (!channelView && page.shown) {
            var filledActivity = copy(TwitchActivityTemplate);
            filledActivity.state = "On Homepage";
            filledActivity.details = "Working on Twitch";
            delete filledActivity.buttons;
            filledActivity.timestamps.start = page.loadedDate.getTime();
            filledActivity.priorityInt = 0;

            return filledActivity;
        }

        if (page.shown && playing) {
            var filledActivity = copy(TwitchActivityTemplate);
            filledActivity.state = title;
            filledActivity.details = "Watching Stream on Twitch";
            filledActivity.buttons[0].url = page.url();
            filledActivity.timestamps.start = page.loadedDate.getTime();
            filledActivity.priorityInt = priorities.MEDIA_VIEWING;

            if (!POLICIES.SHOW_BUTTON_TO_MEDIA) delete filledActivity.buttons;
            return filledActivity;
        }

        if (!page.shown & playing) {
            var filledActivity = copy(TwitchActivityTemplate);
            filledActivity.state = title;
            filledActivity.details = "Background Stream on Twitch";
            filledActivity.buttons[0].url = page.url();
            filledActivity.timestamps.start = page.loadedDate.getTime();
            filledActivity.priorityInt = priorities.MEDIA_IN_BACKGROUND;

            if (!POLICIES.SHOW_BUTTON_TO_MEDIA) delete filledActivity.buttons;
            return filledActivity;
        }

        if (page.shown && channelView && !playing) {
            var filledActivity = copy(TwitchActivityTemplate);
            filledActivity.state = title;
            filledActivity.details = "Paused Stream on Twitch";
            filledActivity.buttons[0].url = page.url();
            filledActivity.timestamps.start = page.loadedDate.getTime();
            filledActivity.priorityInt = priorities.MEDIA_VIEW_PAUSED;

            if (!POLICIES.SHOW_BUTTON_TO_MEDIA) delete filledActivity.buttons;
            return filledActivity;
        }
    }
}

module.exports = handle;