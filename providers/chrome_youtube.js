const priorities = require("../priorities");

const YoutubeActivityTemplate = {
    assets: {
        large_image: "youtube",
        large_text: "Youtube on Chrome"
    },
    buttons: [{
        "label": "Watch on Youtube",
        "url": "NULL"
    }],
    timestamps: { start: Date.now() },
    instance: true,
};

async function handle(page) {
    if (page.url().includes("youtube.com") || page.url().includes("youtu.be")) {
        try {
            var title = await page.evaluate(() => (document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer') ? document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer').textContent : null));
            var running = await page.evaluate(() => { return document.querySelector(".ytp-play-button.ytp-button") ? document.querySelector(".ytp-play-button.ytp-button").title.toLocaleLowerCase().includes("pause") : false });
            if (title != "" && title != null) {
                //console.log("[PROVIDER] [CHROME] [YOUTUBE] Found Video: " + title);

                if (page.shown && running) {
                    var filledActivity = copy(YoutubeActivityTemplate);
                    filledActivity.state = title;
                    filledActivity.details = "Watching Video on YouTube";
                    filledActivity.buttons[0].url = page.url();
                    filledActivity.timestamps.start = page.loadedDate.getTime();
                    filledActivity.priorityInt = priorities.MEDIA_VIEWING;

                    if (!POLICIES.SHOW_BUTTON_TO_MEDIA) delete filledActivity.buttons;
                    return filledActivity;
                }

                if (!page.shown && running) {
                    var filledActivity = copy(YoutubeActivityTemplate);
                    filledActivity.state = title;
                    filledActivity.details = "Background Video on YouTube";
                    filledActivity.buttons[0].url = page.url();
                    filledActivity.timestamps.start = page.loadedDate.getTime();
                    filledActivity.priorityInt = priorities.MEDIA_IN_BACKGROUND;

                    if (!POLICIES.SHOW_BUTTON_TO_MEDIA) delete filledActivity.buttons;
                    return filledActivity;
                }

                if (page.shown && !running) {
                    var filledActivity = copy(YoutubeActivityTemplate);
                    filledActivity.state = title;
                    filledActivity.details = "Paused Video on YouTube";
                    filledActivity.buttons[0].url = page.url();
                    filledActivity.timestamps.start = page.loadedDate.getTime();
                    filledActivity.priorityInt = priorities.MEDIA_VIEW_PAUSED;

                    if (!POLICIES.SHOW_BUTTON_TO_MEDIA) delete filledActivity.buttons;
                    return filledActivity;
                }

            }
        } catch (err) {
            console.error(err);
        }
    }

    return null;
};

module.exports = handle;