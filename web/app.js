const apiURL = "api";
const refreshInterval = 30 * 1000;
var intervalID;
var refreshCount = 0;


function dateToString(d) {
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function stringToDate(s) {
  // '2022-04-22 12:55:01'
  let Y = s.slice(0, 4);
  let m = s.slice(5, 7) - 1;
  let d = s.slice(8, 10);
  let H = s.slice(11, 13);
  let M = s.slice(14, 16);
  let S = s.slice(17, 19);
  return new Date(Y, m, d, H, M, S);
}

function makeChartGetParams(ipaddress, ifindex, data, start, end) {
  let params = "flapchart";
  params += "&host=" + ipaddress;
  params += "&ifindex=" + ifindex;

  params += "&start=" + data.start;
  params += "&end=" + data.end;
  return params;
}

function makeReviewGetParams(data) {
  let params;
  if (isNaN(data.interval)) {
    if (data.interval == "from") {
      params = "start=" + data.start;
    } else if (data.interval == "between") {
      params = "start=" + data.start + "&end=" + data.end;
    } else {
      alert("Wrong period given: " + data.interval);
    }
  } else {
    params = "interval=" + data.interval;
  }

  params += "&filter=" + data.filter;

  return params;
}

function getFormData() {
  let form = $('#main_form');
  let formArr = form.serializeArray();
  data = {};
  for (i = 0; i < formArr.length; i++) {
    data[formArr[i].name] = formArr[i].value;
  }
  return data;
}

function refresh() {
  console.log('Refresh');
  let data = getFormData();
  refreshCount++;
  $('#refresh_count').text(refreshCount);
  review(data);
  toggleTimer();
}

function review(data) {
  let mainForm = $('#main_form')

  mainForm.find('.form-control').attr('disabled', 1);

  $("#progress").show();

  let flapTable = $("#flapTable");
  flapTable.find(".visibleRow").remove();

  let url = "/api?review&" + makeReviewGetParams(data);

  $.get(url, (resp) => {
    if (resp && resp.hosts && resp.hosts.length) {
      $("#empty-template").hide();

      resp.hosts.forEach((host, index) => {

        let hostTemplate = $("#host-template").clone();
        hostTemplate.find('#hostname').text(host.name);
        hostTemplate.find('#ipaddress').text(host.ipaddress);
        hostTemplate.addClass("visibleRow");
        hostTemplate.appendTo(flapTable);
        hostTemplate.fadeIn(300);


        host.ports.forEach((port, index) => {
          let firstFlap = new Date(port.firstFlapTime);
          let lastFlap = new Date(port.lastFlapTime);
          let portTemplate = $("#port-template").clone();

          portTemplate.find("#hostname").text(host.name);
          portTemplate.find("#ifName").text(port.ifName);
          portTemplate.find("#ifAlias").text(port.ifAlias);
          portTemplate.find("#FlapTimes").text(dateToString(firstFlap) + ' - ' + dateToString(lastFlap));
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

          let chartUrl =
            "api?" +
            makeChartGetParams(
              host.ipaddress,
              port.ifIndex,
              data,
              resp.params.timeStart,
              resp.params.timeEnd
            );

          imgTag = portTemplate.find("img");
          imgTag.attr("src", chartUrl);
        });
      });
    } else {
      $("#empty-template").fadeIn();
    }
  });

  $("#progress").hide();
  mainForm.find('.form-control').removeAttr('disabled');
}

function toggleTimer() {
  data = getFormData();
  if (data.interval === "between") {
    if (intervalID !== undefined) {
      clearInterval(intervalID);
    }
  } else {
    if (intervalID !== undefined) {
      clearInterval(intervalID);
    }
    intervalID = setInterval(refresh, refreshInterval);
  }
}

function handleChange() {

  $('#interval').on("change", function () {
    if (this.value === "between") {
      $("#start_block").fadeIn(200);
      $("#end_block").fadeIn(200);

    } else if (this.value === "from") {
      $("#start_block").fadeIn(200);
      $("#end_block").fadeOut(200);

    } else {
      $("#start_block").fadeOut(200);
      $("#end_block").fadeOut(200);

      let virtualEnd = new Date();
      $("#end").val(dateToString(virtualEnd));

      if (!isNaN(this.value)) {
        let virtualStart = new Date(virtualEnd - this.value * 1000);
        $("#start").val(dateToString(virtualStart));
      }

    }
    refresh();
  });
}

function handleRefresh() {
  $('#refreshButton').click(function (e) {
    e.preventDefault();
    refresh();
  });

}