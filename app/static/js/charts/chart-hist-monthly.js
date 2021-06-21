// Set new default font family and font color to mimic Bootstrap's default styling
(Chart.defaults.global.defaultFontFamily = "Nunito"),
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#858796";

const ctxMonthly = document.getElementById("monthlyHistogram").getContext("2d");

const chartMonthly = new Chart(ctxMonthly, {
  type: "bar",
  data: {},
  options: {
    title: {
      display: true,
    },
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
      display: false,
    },
  },
});

const optionsMonthly = { weekday: "short", day: "2-digit" };

// TODO: labels every 30 minutes
// TODO: handle statuses other than 200 OK
// TODO: set ylim to zero

const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

const updateHistogramMonthly = function (date_string) {
  $.ajax({
    type: "GET",
    url: `/monthly/${date_string}`,
    dataType: "json",
    success: function (result) {
      // remainingDays are computed in order to fill with zeros the remaining days of the current month in the plot
      let remainingDays;
      const lastSavedDate =
        result.slice(-1)[0]?.created && new Date(result.slice(-1)[0].created);

      const nrgArray = result.map((item) => item.nrg_td / 1000);
      const daysArray = result.map((item) =>
        new Date(item.created).toLocaleDateString("it-IT", optionsMonthly)
      );
      const totalPower = nrgArray.reduce((a, b) => a + b, 0).toFixed(1);
      // console.log(totalPower);

      // If month is in the future, lastSavedDate is undefined
      if (lastSavedDate) {
        const lastSavedDay = lastSavedDate.getDate();
        const numberDaysInMonth = daysInMonth(
          lastSavedDate.getMonth() + 1,
          lastSavedDate.getFullYear()
        );

        remainingDays = Array.from(
          new Array(numberDaysInMonth - lastSavedDay),
          (x, i) => i + lastSavedDay + 1
        );
      } else {
        remainingDays = Array();
      }

      // console.log(remainingDays);
      // console.log(new Array(remainingDays.length).fill(0));

      chartMonthly.data = {
        labels: daysArray.concat(remainingDays),
        datasets: [
          {
            label: "Monthly Production",
            data: nrgArray.concat(new Array(remainingDays.length).fill(0)), // array filled with zeros
            backgroundColor: "#1cc88a",
          },
        ],
      };
      chartMonthly.options.title.text = `Totale: ${totalPower} kWh`;
      chartMonthly.update();
    },
  });
};

const month_input = document.getElementById("month-input");

updateHistogramMonthly(month_input.value);

month_input.addEventListener("change", function (e) {
  e.target.blur();
  updateHistogramMonthly(month_input.value);
});
