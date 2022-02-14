const activityProvider = require("../activityProvider");
const psList = require('@667/ps-list');
const { windowManager } = require("node-window-manager");
const priorities = require("../priorities");

const provider = new activityProvider("Minecraft", 0);

const MinecraftActivityTemplate = {
    assets: {
        large_image: "minecraft",
        large_text: "Minecraft Java Edition"
    },
    timestamps: { start: Date.now() },
    instance: true,
};

var DETECT_START_DATE = {};

async function refresh() {
    var processes = await psList({ all: true });
    for (const process of processes) {
        if (process.name.includes("java") && process.cmd.includes("mojang")) {
            try {
                if (DETECT_START_DATE[process.pid] == null) DETECT_START_DATE[process.pid] = new Date();
                //console.log("[PROVIDER] [MC] Minecraft (Mojang) found: " + process.pid);
                var window = windowManager.getWindows().find((window) => { return window.processId == process.pid; });
                if (window != null) {
                    var activeOne = windowManager.getActiveWindow().processId == window.processId;
                    var title = window.getTitle();

                    if (activeOne) {
                        var filledActivity = copy(MinecraftActivityTemplate);
                        filledActivity.state = "In Game";
                        filledActivity.details = title.replace("D3DFocusWindow", "Minecraft");
                        filledActivity.timestamps.start = DETECT_START_DATE[process.pid].getTime();
                        filledActivity.priorityInt = priorities.GAME_PLAYING;
                        provider.currentActivity = filledActivity;
                        return;
                    }

                    if (!activeOne) {
                        var filledActivity = copy(MinecraftActivityTemplate);
                        filledActivity.state = "In Background";
                        filledActivity.details = title.replace("D3DFocusWindow", "Minecraft");
                        filledActivity.timestamps.start = DETECT_START_DATE[process.pid].getTime();
                        filledActivity.priorityInt = priorities.GAME_IN_BACKGROUND;
                        provider.currentActivity = filledActivity;
                        return;
                    }

                }
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