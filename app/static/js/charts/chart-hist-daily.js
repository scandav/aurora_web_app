// Set new default font family and font color to mimic Bootstrap's default styling
(Chart.defaults.global.defaultFontFamily = "Nunito"),
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#858796";

const ctxDaily = document.getElementById("dailyHistogram").getContext("2d");
const ctxTemp = document.getElementById("temperaturePlot").getContext("2d");

const chartDaily = new Chart(ctxDaily, {
  type: "bar",
  data: {},
  options: {
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },
    title: {
      display: true,
    },
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
  },
});

const chartTemperature = new Chart(ctxTemp, {
  type: "line",
  data: {},
  options: {
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: "top",
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  },
});

const optionsDaily = { hour: "2-digit", minute: "2-digit" };
const optionsTemp = { hour: "2-digit", minute: "2-digit" };

// TODO: labels every 30 minutes
// TODO: handle statuses other than 200 OK

const updatePlotsDaily = function (date_string) {
  $.ajax({
    type: "GET",
    url: `/daily/${date_string}`,
    dataType: "json",
    success: function (result) {
      const powerArray = result.map((item) => item.grid_power);
      const timeArray = result.map((item) =>
        new Date(item.created).toLocaleTimeString("it-IT", optionsDaily)
      );
      const totalPower = (result.slice(-1)[0]?.nrg_td / 1000).toFixed(1);
      // console.log(totalPower);

      chartDaily.data = {
        labels: timeArray,
        datasets: [
          {
            label: "Daily Production",
            data: powerArray,
            backgroundColor: "rgba(78, 115, 223, 1)",
          },
        ],
      };
      chartDaily.options.title.text = isNaN(totalPower)
        ? ""
        : `Totale: ${totalPower} kWh`;
      chartDaily.update();

      chartTemperature.data = {
        labels: result.map((item) =>
          new Date(item.created).toLocaleTimeString("it-IT", optionsDaily)
        ),
        datasets: [
          {
            label: "Boost Converter",
            borderColor: "rgb(54,185,204)",
            fill: false,
            data: result.map((item) => item.booster_temp),
          },
          {
            label: "Inverter",
            borderColor: "rgb(231,74,59)",
            fill: false,
            data: result.map((item) => item.invert_temp),
          },
        ],
      };
      chartTemperature.update();
    },
  });
};

const day_input = document.getElementById("day-input");
const refreshBtn = document.getElementById("refreshDaily");

updatePlotsDaily(day_input.value);

day_input.addEventListener("change", function (e) {
  e.target.blur();
  updatePlotsDaily(day_input.value);
});

refreshBtn.addEventListener("click", function () {
  // updatePlotsDaily(day_input.value);
  // e.preventDefault();
  const todaysDate = new Date().toISOString().replace(/T.*/, "");
  day_input.value = todaysDate;
  updatePlotsDaily(todaysDate);
});
