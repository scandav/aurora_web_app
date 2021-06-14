// Set new default font family and font color to mimic Bootstrap's default styling
(Chart.defaults.global.defaultFontFamily = "Nunito"),
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#858796";

const ctxMonthly = document.getElementById("monthlyHistogram").getContext("2d");

const chartMonthly = new Chart(ctxMonthly, {
  type: "bar",
  data: {},
  options: {
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
  },
});

const optionsMonthly = { weekday: "short", day: "2-digit" };

// TODO: labels every 30 minutes
// TODO: handle statuses other than 200 OK
// TODO: set ylim to zero

const updateHistogramMonhly = function (date_string) {
  $.ajax({
    type: "GET",
    url: `/monthly/${date_string}`,
    dataType: "json",
    success: function (result) {
      chartMonthly.data = {
        labels: result.map((item) =>
          new Date(item.created).toLocaleDateString("it-IT", optionsMonthly)
        ),
        datasets: [
          {
            label: "Monthly Production",
            data: result.map((item) => item.nrg_td / 1000),
            backgroundColor: "#1cc88a",
          },
        ],
      };
      chartMonthly.update();
    },
  });
};

const month_input = document.getElementById("month-input");

updateHistogramMonhly(month_input.value);

month_input.addEventListener("change", function (e) {
  e.target.blur();
  updateHistogramMonhly(month_input.value);
});
