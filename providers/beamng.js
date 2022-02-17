const activityProvider = require("../activityProvider");
const psList = require('@667/ps-list');
const { windowManager } = require("node-window-manager");
const priorities = require("../priorities");

const provider = new activityProvider("Minecraft", 0);

const BEAMNGActivityTemplate = {
    assets: {
        large_image: "game_beamng",
        large_text: "BeamNG.drive via Steam"
    },
    timestamps: { start: Date.now() },
    instance: true,
};

var DETECT_START_DATE = {};

async function refresh() {
    var processes = await psList({ all: true });

    var beamng = processes.filter((process) => { return process.name.toLowerCase().includes("beamng") });
    var beammp = processes.filter((process) => { return process.name.toLowerCase().includes("beammp") });

    if (beamng.length > 0) {
        var process = beamng[0];
        if (!DETECT_START_DATE[process.pid]) DETECT_START_DATE[process.pid] = new Date();

        if (beammp.length > 0) {
            var filledActivity = copy(BEAMNGActivityTemplate);
            filledActivity.state = "Wrecking Cars";
            filledActivity.details = "BeamNG.Drive (BeamMP)";
            filledActivity.timestamps.start = DETECT_START_DATE[process.pid].getTime();
            filledActivity.priorityInt = priorities.GAME_PLAYING;
            provider.currentActivity = filledActivity;
            return;
        } else {
            var filledActivity = copy(BEAMNGActivityTemplate);
            filledActivity.state = "Wrecking Cars";
            filledActivity.details = "BeamNG.Drive";
            filledActivity.timestamps.start = DETECT_START_DATE[process.pid].getTime();
            filledActivity.priorityInt = priorities.GAME_PLAYING;
            provider.currentActivity = filledActivity;
            return;
        }
    }

    provider.currentActivity = null;

    return null;
}

provider.refresh = refresh;
module.exports = provider;