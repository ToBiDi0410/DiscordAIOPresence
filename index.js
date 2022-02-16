const RPC = require('discord-rpc');
const client = new RPC.Client({ transport: 'ipc' });

var providers = [];
providers.push(require("./providers/chrome"));
providers.push(require("./providers/minecraft"));
providers.push(require("./providers/seaofthieves"));

const demo = false;

global.POLICIES = {
    SHOW_BUTTON_TO_MEDIA: false
};

(async() => {
    if (!demo) await connectToDC();
    await runTasks();
})();

async function runTasks() {
    for (const provider of providers) {
        await provider.refresh();
    }

    var foundActivity = null;
    providers.forEach((provider) => {
        provider.calculatedPriority = (provider.getActivity() && provider.getActivity().priorityInt) ? provider.priority + provider.getActivity().priorityInt : provider.priority;
    });
    for (const provider of providers.sort(function(a, b) { return b.calculatedPriority - a.calculatedPriority })) {
        if (provider.getActivity() != null) {
            foundActivity = provider.getActivity();
            break;
        }
    }


    if (foundActivity == null) foundActivity = {...emptyActivity, timestamps: { start: new Date() } };

    //MIGRATE
    if (foundActivity.timestamps) foundActivity.startTimestamp = foundActivity.timestamps.start;
    if (foundActivity.assets && foundActivity.assets.large_image) foundActivity.largeImageKey = foundActivity.assets.large_image;
    if (foundActivity.assets && foundActivity.assets.large_text) foundActivity.largeImageText = foundActivity.assets.large_text;

    if (!isSame({...foundActivity, timestamps: null, startTimestamp: null }, {...currentShownActivity, timestamps: null, startTimestamp: null })) {
        await commitActivity(foundActivity);
    }


    setTimeout(runTasks, 1000);
}

var currentShownActivity = {};
async function commitActivity(activity) {
    if (activity.NOT_FOUND) {
        if (!demo) client.clearActivity(process.pid);
        console.log("[DC] Cleared Activity");
    } else {
        if (!demo) client.setActivity(activity, process.pid);
        console.log("[DC] Set new Activity: " + activity.details + " (" + activity.state + ")");
    }
    currentShownActivity = copy(activity);
}

function isSame(obj1, obj2) {
    var obj1json = JSON.stringify(obj1);
    var obj2json = JSON.stringify(obj2);
    //console.log(obj1json + "\n" + obj2json);
    return obj1json == obj2json;
}

global.copy = function(obj) {
    return JSON.parse(JSON.stringify(obj));
}

async function connectToDC() {
    var CONNECTED = new Promise((resolve, reject) => {
        client.on('connected', resolve);
    });

    var READY = new Promise((resolve, reject) => {
        client.on('ready', resolve);
    });

    client.login({ clientId: "942148807230124042" });

    await CONNECTED;
    console.log("[DC] Connected to Discords Server");
    await READY;
    console.log("[DC] Client is ready");
}

const timer = function(time) { return new Promise((resolve, reject) => { setTimeout(resolve, time); }) }

const emptyActivity = {
    details: "Idling",
    assets: {
        large_image: "idling",
        large_text: "Nothing here"
    },
    timestamps: { start: Date.now() },
    instance: true,
};