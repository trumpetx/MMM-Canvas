/* Magic Mirror
 * Module: MMM-CANVAS
 *
 * By Chase Cromwell
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');
module.exports = NodeHelper.create({
    start() {
        console.log("Starting node_helper for: " + this.name);
    },

    getCANVAS(payload) {
        const finalpayload = [];
        const courses = payload.courses;
        let count = 0;
        courses.forEach((course, index) => {
            const url = `https://${payload.urlbase}/api/v1/courses/${course}/assignments?access_token=${payload.accessKey}&per_page=30&bucket=upcoming&order_by=due_at`;
            request({
                url,
                method: 'GET'
            }, (error, response, body) => {
                const assignments = [];
                if (!error && response.statusCode == 200) {
                    const result = JSON.parse(body);
                    for (const j in result) {
                        assignments.push({
                            name: result[j].name,
                            due_at: result[j].due_at,
                            index
                        });
                    }
                } else {
                    console.log("MMM-Canvas Error", error);
                }
                finalpayload.push(assignments);
                count++;
            });
        });
        const intervalId = setInterval(() => {
            if (count == courses.length) {
                this.sendSocketNotification('CANVAS_RESULT', finalpayload);
                clearInterval(intervalId);
            }
        }, 400);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'GET_CANVAS') {
            this.getCANVAS(payload);
        }
    }
});
