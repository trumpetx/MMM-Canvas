/* Magic Mirror
 * Module: MMM-CANVAS
 *
 * By Chase Cromwell
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');
let finalpayload = [ ];
module.exports = NodeHelper.create({
    start() {
        console.log("Starting node_helper for: " + this.name);
    },

    getCANVAS(payload) {
        const key = payload[0];
        const courses = payload[1];
        const urlbase = payload[2];
        let count = 0;
        courses.forEach(runCourses);
        setInterval(() => {
            if (count == courses.length) {
                this.sendSocketNotification('CANVAS_RESULT', finalpayload);
                finalpayload = [ ];
                count = 0;
            }
        }, 400);

        function runCourses(item, index) {
            var url = "https://"+ urlbase +"/api/v1/courses/" + courses[index] + "/assignments?access_token=" + key + "&per_page=30&bucket=upcoming&order_by=due_at";
            request({
                url: url,
                method: 'GET'
            }, (error, response, body) => {
                const smallpayload = [ ];
                if (!error && response.statusCode == 200) {
                    const result = JSON.parse(body);
                    for (const j in result) {
                        smallpayload.push([result[j].name, result[j].due_at, index]);
                    }
                } else {
                  smallpayload.push(["ERROR", JSON.parse(error), ""]);
                }
                finalpayload.push(smallpayload);
                count++;
            });
        }
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'GET_CANVAS') {
            this.getCANVAS(payload);
        }
    }
});
