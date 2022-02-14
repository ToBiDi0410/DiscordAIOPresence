const priorities = require("../priorities");

const ILRActivityTemplate = {
    assets: {
        large_image: "iloveradio",
        large_text: "ILoveRadio on Chrome"
    },
    buttons: [{
        "label": "Listen too",
        "url": "NULL"
    }],
    timestamps: { start: Date.now() },
    instance: true,
};

async function handle(page) {
    if (page.url().includes("ilovemusic.de") || page.url().includes("ilovemusic.com")) {
        var playing = await page.evaluate(() => { return document.querySelector("#playstop") ? document.querySelector("#playstop").innerHTML : null; });
        playing = playing != null && playing == 1
        if (playing) {
            var title = await page.evaluate(() => { return document.querySelector(".channelname").innerHTML; });
            var filledActivity = copy(ILRActivityTemplate);
            filledActivity.state = title;
            filledActivity.details = "Listening to ILoveRadio";
            filledActivity.buttons[0].url = page.url();
            filledActivity.timestamps.start = page.loadedDate.getTime();
            filledActivity.priorityInt = priorities.MEDIA_HEARING;

            if (!POLICIES.SHOW_BUTTON_TO_MEDIA) delete filledActivity.buttons;
            return filledActivity;
        }
    }
}

module.exports = handle;