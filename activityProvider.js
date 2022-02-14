class activityProvider {

    name;
    active;
    priority; //THE BASE PRIORITY

    currentActivity;
    refresh;

    constructor(name, priority) {
        this.name = name;
        this.priority = priority;
    }

    getActivity() {
        return this.currentActivity;
    }
}

module.exports = activityProvider;