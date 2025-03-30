/* Magic Mirror
 * Module: MMM-CANVAS
 *
 * By Chase Cromwell
 *
 */
Module.register("MMM-Canvas", {

    // Module config defaults.
    defaults: {
        accessKey: "", //Access key
        updateInterval: 60 * 60 * 1000, //One hour
        colors: ["blue",],
        courses: ["28733",],
        urlbase: "dummyurl.edu",
        assignMaxLen: 35,
        assignToDisplay: 12,
        dateFormat: "M/D h:mm A",
        headerText: "Upcoming Due Dates",
    },

    getStyles() {
        return ["canvas.css"];
    },

    getScripts() {
        return ["moment.js"];
    },

    start() {
        Log.info("Starting module: " + this.name);
        this.CANVAS = [];
        this.scheduleUpdate();
    },

    getDom() {
        const wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        if (!this.loaded) {
            wrapper.innerHTML = this.translate("Loading Canvas . . .");
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        const top = document.createElement("div");
        top.classList.add("list-row");

        const Table = document.createElement("table");
        const TableHeaderRow = document.createElement("tr");
        const TableHead = document.createElement("th");
        TableHead.classList.add("align-left", "small", "bright");
        TableHead.innerHTML = this.config.headerText;
        TableHeaderRow.appendChild(TableHead);
        Table.appendChild(TableHeaderRow);

        for (const assignment of this.CANVAS) {
            const textColor = this.config.colors[assignment.index % this.config.colors.length];
            const Row = document.createElement("tr");
            const newElement = document.createElement("td");
            const newElement1 = document.createElement("td");
            newElement.classList.add("align-left", "small");
            newElement1.classList.add("align-right", "small");
            newElement.innerHTML = assignment.name.slice(0, this.config.assignMaxLen);
            newElement1.innerHTML = new moment(assignment.due_at).format(this.config.dateFormat);
            newElement1.style.color = textColor;
            newElement.style.color = textColor;
            Row.appendChild(newElement);
            Row.appendChild(newElement1);
            Table.appendChild(Row);
        }

        wrapper.appendChild(Table);
        const timestamp = document.createElement("div");
        timestamp.classList.add("small", "bright", "timestamp");
        timestamp.innerHTML = "Last Checked at " + new moment().format('h:mm a');
        timestamp.style.fontSize = "x-small";
        wrapper.appendChild(timestamp);
        return wrapper;
    },

    notificationReceived(notification, payload) {
        if (notification === 'HIDE_CANVAS') {
            this.hide();
        } else if (notification === 'SHOW_CANVAS') {
            this.show(1000);
        }

    },

    processCANVAS(data) {
        data = data.flat(1);
        data.sort((result1, result2) => new moment(result1.due_at) - new moment(result2.due_at));
        this.CANVAS = data.slice(0, this.config.assignToDisplay);
        this.loaded = true;
    },

    scheduleUpdate() {
        this.getCANVAS();
        setInterval(() => this.getCANVAS(), this.config.updateInterval);
    },

    getCANVAS() {
        this.sendSocketNotification('GET_CANVAS', {
            accessKey: this.config.accessKey,
            courses: this.config.courses,
            urlbase: this.config.urlbase,
        });
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "CANVAS_RESULT") {
            this.processCANVAS(payload);
            this.updateDom();
        }
        this.updateDom();
    },
});
