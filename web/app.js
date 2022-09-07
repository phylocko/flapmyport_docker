const DEFAULT_INTERVAL = "3600";
const INTERVAL_FROM = "from";
const INTERVAL_BETWEEN = "between";
const REFRESH_INTERVAL = 30 * 1000;

class FMPDate extends Date {
    leadingZero(value) {
        if (value < 10) value = "0" + value;
        return value;
    }

    toLocalString() {
        let Y = this.getFullYear();
        let m = this.leadingZero(this.getMonth() + 1);
        let d = this.leadingZero(this.getDate());
        let H = this.leadingZero(this.getHours());
        let M = this.leadingZero(this.getMinutes());
        let S = this.leadingZero(this.getSeconds());

        return Y + "-" + m + "-" + d + " " + H + ":" + M + ":" + S;
    }

    toUTCString() {
        let Y = this.getUTCFullYear();
        let m = this.leadingZero(this.getUTCMonth() + 1);
        let d = this.leadingZero(this.getUTCDate());
        let H = this.leadingZero(this.getUTCHours());
        let M = this.leadingZero(this.getMinutes());
        let S = this.leadingZero(this.getSeconds());

        return Y + "-" + m + "-" + d + " " + H + ":" + M + ":" + S;
    }

    static fromLocalString(s) {
        // '2022-04-22 12:55:01'
        let Y = s.slice(0, 4);
        let m = s.slice(5, 7) - 1;
        let d = s.slice(8, 10);
        let H = s.slice(11, 13);
        let M = s.slice(14, 16);
        let S = s.slice(17, 19);
        return new FMPDate(Y, m, d, H, M, S);
    }

    static dateIsValid(date) {
        return date instanceof Date && !isNaN(date);
    }
}

class Controller {
    constructor() {
        this.intervalID = null;

        this.interval = DEFAULT_INTERVAL;
        this.end = null;
        this.start = null;
        this.filter = [];

        this.refresh_count = 0;

        $("#interval").on("change", this.refresh);

        $("#refreshButton").click((e) => {
            e.preventDefault();
            this.refresh();
        });

        this.refresh();
    }

    reviewURL = () => {
        let url = "/api?review";

        if (!isNaN(this.interval)) {
            url += "&interval=" + this.interval;
        } else if (this.interval == INTERVAL_FROM) {
            url += "&start=" + this.start.toUTCString();
        } else if (this.interval == INTERVAL_BETWEEN) {
            url += "&start=" + this.start.toUTCString() + "&end=" + this.end.toUTCString();
        }

        if (this.filter.length > 0) {
            url += "&filter=" + this.filter.join(" ");
        }
        return encodeURI(url);
    }

    chartURL = (ipaddress, ifIndex) => {
        let url = "/api?flapchart&host=" + ipaddress + "&ifindex=" + ifIndex;

        if (!isNaN(this.interval)) {
            url += "&interval=" + this.interval;

        } else if (this.interval == INTERVAL_FROM) {
            url += "&start=" + this.start.toUTCString();

        } else if (this.interval == INTERVAL_BETWEEN) {
            url += "&start=" + this.start.toUTCString() + "&end=" + this.end.toUTCString();

        }

        return encodeURI(url);
    }

    readForm = () => {
        let form_arr = $("#main_form").serializeArray();

        let data = {};
        for (let i = 0; i < form_arr.length; i++) {
            data[form_arr[i].name] = form_arr[i].value;
        }

        this.filter = data.filter.split(" ");
        this.interval = data.interval;

        if (!isNaN(this.interval)) {
            this.end = new FMPDate();
            this.start = new FMPDate(this.end - this.interval * 1000);
        } else {
            this.end = new FMPDate();
            this.start = new FMPDate(this.end - 3600 * 1000);

            let start_date = FMPDate.fromLocalString(data.start);
            if (FMPDate.dateIsValid(start_date)) {
                this.start = start_date;
            }

            let end_date = FMPDate.fromLocalString(data.end);
            if (FMPDate.dateIsValid(end_date)) {
                this.end = end_date;
            }

        }
    }

    orderFormElements = () => {
        if (this.interval === "between") {
            $("#start_block").fadeIn(200);
            $("#end_block").fadeIn(200);

        } else if (this.interval === "from") {
            $("#start_block").fadeIn(200);

        } else {
            $("#start_block").fadeOut(200);
            $("#end_block").fadeOut(200);

        }

        $("#start").val(this.start.toLocalString());
        $("#end").val(this.end.toLocalString());

    }

    refresh = () => {
        this.readForm();
        this.orderFormElements();
        this.updateTable();
        this.refresh_count++;
        $("#refresh_count").text(this.refresh_count);
        this.toggleTimer();
    }

    updateTable = () => {
        $("#main_form").find(".form-control").attr("disabled", 1);
        $("#progress").show();

        let flapTable = $("#flapTable");
        flapTable.find(".visibleRow").remove();

        let url = this.reviewURL();

        $.get(url, (resp) => {
            if (resp && resp.hosts && resp.hosts.length) {
                $("#empty-template").hide();

                resp.hosts.forEach((host, index) => {
                    let hostTemplate = $("#host-template").clone();
                    hostTemplate.find("#hostname").text(host.name);
                    hostTemplate.find("#ipaddress").text(host.ipaddress);
                    hostTemplate.addClass("visibleRow");
                    hostTemplate.appendTo(flapTable);
                    hostTemplate.fadeIn(300);

                    host.ports.forEach((port, index) => {
                        let firstFlap = new FMPDate(port.firstFlapTime);
                        let lastFlap = new FMPDate(port.lastFlapTime);
                        let portTemplate = $("#port-template").clone();

                        portTemplate.find("#hostname").text(host.name);
                        portTemplate.find("#ifName").text(port.ifName);
                        portTemplate.find("#ifAlias").text(port.ifAlias);

                        portTemplate
                            .find("#FlapTimes")
                            .text(
                                firstFlap.toLocalString() + " - " + lastFlap.toLocalString()
                            );

                        portTemplate.find("#flapCount").text(port.flapCount);

                        let statusTag = portTemplate.find("#ifOperStatus");
                        statusTag.text(port.ifOperStatus);

                        if (port.ifOperStatus === "up") {
                            statusTag.addClass("text-success");
                        } else if (port.ifOperStatus === "down") {
                            statusTag.addClass("text-danger");
                        } else {
                            statusTag.addClass("gray-text");
                        }
                        portTemplate.addClass("visibleRow");
                        portTemplate.appendTo(flapTable);
                        portTemplate.fadeIn(300);

                        let chart_url = this.chartURL(
                            host.ipaddress,
                            port.ifIndex
                        );

                        let imgTag = portTemplate.find("img");
                        imgTag.attr("src", chart_url);
                    });
                });
            } else {
                $("#empty-template").fadeIn();
            }
        });

        $("#progress").fadeOut(200);
        $("#main_form").find(".form-control").removeAttr("disabled");
    }

    toggleTimer = () => {
        if (this.interval === INTERVAL_BETWEEN) {
            if (this.intervalID !== null) {
                clearInterval(this.intervalID);
                this.intervalID = null;
            }

        } else {
            if (this.intervalID !== null) {
                clearInterval(this.intervalID);
                this.intervalID = null;
            }
            this.intervalID = setInterval(this.refresh, REFRESH_INTERVAL);
        }
    }

}
