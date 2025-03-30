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
    },

    getStyles: function () {
        return ["canvas.css"];
    },

    getScripts: function () {
        return ["moment.js"];
    },


    start: function () {
        Log.info("Starting module: " + this.name);
        this.CANVAS = {};
        this.scheduleUpdate();
    },


    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        //wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("Loading Canvas . . .");
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        var CANVAS = this.CANVAS;

        var top = document.createElement("div");
        top.classList.add("list-row");

        // create table
        var Table = document.createElement("table");

        // create row and column for Currency
        var Row = document.createElement("tr");
        var Column = document.createElement("th");
        Column.classList.add("align-left", "small", "bright", "Currency");
        Column.innerHTML = "Upcoming Due Dates";
        Row.appendChild(Column);

        // create row and column for Rate
        var Rate = document.createElement("th");
        Rate.classList.add("align-left", "small", "bright", "Rate");
        Rate.innerHTML = "";
        Row.appendChild(Rate);


        Table.appendChild(Row);
        CANVAS.sort((smallpayload1, smallpayload2) => new moment(smallpayload1[1]) - new moment(smallpayload2[1]));
        for (const smallpayload of CANVAS.slice(0, this.config.assignToDisplay)) {
            //// Learned this on jsfiddle. HOORAY!
            //// This dynamically creates the div/tags for each element of CANVAS.quotes
            var Row = document.createElement("tr");
            var newElement = document.createElement("td");
            var newElement1 = document.createElement("td");
            newElement.classList.add("align-left", "small");
            newElement1.classList.add("align-right", "small");
            newElement.innerHTML = smallpayload[0].slice(0, this.config.assignMaxLen);
            newElement1.innerHTML = moment(smallpayload[1]).format(this.config.dateFormat);
            newElement1.style.color = this.config.colors[smallpayload[2]];
            newElement.style.color = this.config.colors[smallpayload[2]];


            Row.appendChild(newElement);
            Row.appendChild(newElement1);
            Table.appendChild(Row);

        } // <-- closes key/pair loop
        wrapper.appendChild(Table);
        var timestamp = document.createElement("div");
        timestamp.classList.add("small", "bright", "timestamp");
        timestamp.innerHTML = "Last Checked " + moment().format('h:mm a') + " today";
        timestamp.style.fontSize = "x-small";
        wrapper.appendChild(timestamp);
        return wrapper;
    }, // closes getDom




    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function (notification, payload) {
        if (notification === 'HIDE_CANVAS') {
            this.hide();
        } else if (notification === 'SHOW_CANVAS') {
            this.show(1000);
        }

    },


    processCANVAS: function (data) {
        this.CANVAS = data.flat(1);
        this.loaded = true;
    },

    scheduleUpdate: function () {
        setInterval(() => {
            this.getCANVAS();
        }, this.config.updateInterval);
        this.getCANVAS();
    },

    getCANVAS: function () {
        var payload = [this.config.accessKey, this.config.courses, this.config.urlbase];
        this.sendSocketNotification('GET_CANVAS', payload);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "CANVAS_RESULT") {
            this.processCANVAS(payload);

            this.updateDom();
        }
        this.updateDom();
    },
});
