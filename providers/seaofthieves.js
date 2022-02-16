const activityProvider = require("../activityProvider");
const psList = require('@667/ps-list');
const { windowManager } = require("node-window-manager");
const priorities = require("../priorities");

const provider = new activityProvider("Minecraft", 0);

const SOTActivityTemplate = {
    assets: {
        large_image: "game_sot",
        large_text: "Sea of Thieves (XBOX)"
    },
    timestamps: { start: Date.now() },
    instance: true,
};

var DETECT_START_DATE = {};

async function refresh() {
    var processes = await psList({ all: true });

    for (const process of processes) {

        if (process.name.toLowerCase().includes("sotgame")) {
            try {
                if (DETECT_START_DATE[process.pid] == null) DETECT_START_DATE[process.pid] = new Date();

                var filledActivity = copy(SOTActivityTemplate);
                filledActivity.state = "Playing the Game";
                filledActivity.details = "Sea of Thieves";
                filledActivity.timestamps.start = DETECT_START_DATE[process.pid].getTime();
                filledActivity.priorityInt = priorities.GAME_PLAYING;
                provider.currentActivity = filledActivity;
                return;
            } catch (err) {
                console.error(err);
            }
        }
    }

    provider.currentActivity = null;

    return null;
}

provider.refresh = refresh;
module.exports = provider;