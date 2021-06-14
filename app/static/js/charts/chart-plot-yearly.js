// Set new default font family and font color to mimic Bootstrap's default styling
(Chart.defaults.global.defaultFontFamily = "Nunito"),
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#858796";

const ctxYearly = document.getElementById("yearlyPlot").getContext("2d");
const ctxCumYearly = document.getElementById("yearlyCumPlot").getContext("2d");

const chartYearly = new Chart(ctxYearly, {
  type: "line",
  data: {
    datasets: [],
    labels: [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Setttembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ],
  },
  options: {
    maintainAspectRatio: false,
    legend: {
      display: true,
    },
  },
});
const chartCumYearly = new Chart(ctxCumYearly, {
  type: "line",
  data: {
    datasets: [],
    labels: [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Setttembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ],
  },
  options: {
    maintainAspectRatio: false,
    legend: {
      display: true,
    },
  },
});

const optionsYearly = { month: "long" };
const plotColors = [
  "#4e73df",
  "#1cc88a",
  "#f6c23e",
  "#f6c23e",
  "#f6c23e",
  "#36b9cc",
  "#e74a3b",
  "#f8f9fc",
  "#5a5c69",
  "#858796",
];

// // TODO: labels every 30 minutes
// // TODO: handle statuses other than 200 OK

const capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const cumulativeSum = (sum) => (value) => (sum += value.nrg_td);

const updatePlotYearly = function (year) {
  $.ajax({
    type: "GET",
    url: `/yearly/${year}`,
    dataType: "json",
    success: function (result) {
      result.forEach(
        (el, idx) =>
          (el.cumsum =
            idx === 0 ? el.nrg_td : result[idx - 1].cumsum + el.nrg_td)
      );

      chartYearly.data.datasets.push({
        label: `${year}`,
        borderColor: plotColors[year - 2019],
        fill: false,
        data: result.map((item) => ({
          x: capitalizeFirstLetter(
            new Date(item.created).toLocaleDateString("it-IT", optionsYearly)
          ),
          y: item.nrg_td / 1000,
        })),
      });
      chartYearly.update();

      if (year === 2019) return;

      chartCumYearly.data.datasets.push({
        label: `${year}`,
        borderColor: plotColors[year - 2019],
        fill: false,
        data: result.map((item) => ({
          x: capitalizeFirstLetter(
            new Date(item.created).toLocaleDateString("it-IT", optionsYearly)
          ),
          y: item.cumsum / 1000,
        })),
      });
      chartCumYearly.update();
    },
  });
};

const currentYear = new Date().getFullYear();

for (y = 2019; y <= currentYear; y++) {
  updatePlotYearly(y);
}

// const day_input = document.getElementById("day-input");
// day_input.addEventListener("change", function () {
//   updateHistogramDaily(day_input.value);
// });

// function number_format(number, decimals, dec_point, thousands_sep) {
//   // *     example: number_format(1234.56, 2, ',', ' ');
//   // *     return: '1 234,56'
//   number = (number + "").replace(",", "").replace(" ", "");
//   var n = !isFinite(+number) ? 0 : +number,
//     prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
//     sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
//     dec = typeof dec_point === "undefined" ? "." : dec_point,
//     s = "",
//     toFixedFix = function (n, prec) {
//       var k = Math.pow(10, prec);
//       return "" + Math.round(n * k) / k;
//     };
//   // Fix for IE parseFloat(0.55).toFixed(0) = 0;
//   s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
//   if (s[0].length > 3) {
//     s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
//   }
//   if ((s[1] || "").length < prec) {
//     s[1] = s[1] || "";
//     s[1] += new Array(prec - s[1].length + 1).join("0");
//   }
//   return s.join(dec);
// }

// // Area Chart Example
// var ctx = document.getElementById("myAreaChart");
// var myLineChart = new Chart(ctx, {
//   type: "line",
//   data: {
//     labels: [
//       "Fuck",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ],
//     datasets: [
//       {
//         label: "Earnings",
//         lineTension: 0.3,
//         backgroundColor: "rgba(78, 115, 223, 0.05)",
//         borderColor: "rgba(78, 115, 223, 1)",
//         pointRadius: 3,
//         pointBackgroundColor: "rgba(78, 115, 223, 1)",
//         pointBorderColor: "rgba(78, 115, 223, 1)",
//         pointHoverRadius: 3,
//         pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
//         pointHoverBorderColor: "rgba(78, 115, 223, 1)",
//         pointHitRadius: 10,
//         pointBorderWidth: 2,
//         data: [
//           30000, 10000, 5000, 15000, 10000, 20000, 15000, 25000, 20000, 30000,
//           25000, 40000,
//         ],
//       },
//     ],
//   },
//   options: {
//     maintainAspectRatio: false,
//     layout: {
//       padding: {
//         left: 10,
//         right: 25,
//         top: 25,
//         bottom: 0,
//       },
//     },
//     scales: {
//       xAxes: [
//         {
//           time: {
//             unit: "date",
//           },
//           gridLines: {
//             display: false,
//             drawBorder: false,
//           },
//           ticks: {
//             maxTicksLimit: 7,
//           },
//         },
//       ],
//       yAxes: [
//         {
//           ticks: {
//             maxTicksLimit: 5,
//             padding: 10,
//             // Include a dollar sign in the ticks
//             callback: function (value, index, values) {
//               return "$" + number_format(value);
//             },
//           },
//           gridLines: {
//             color: "rgb(234, 236, 244)",
//             zeroLineColor: "rgb(234, 236, 244)",
//             drawBorder: false,
//             borderDash: [2],
//             zeroLineBorderDash: [2],
//           },
//         },
//       ],
//     },
//     legend: {
//       display: false,
//     },
//     tooltips: {
//       backgroundColor: "rgb(255,255,255)",
//       bodyFontColor: "#858796",
//       titleMarginBottom: 10,
//       titleFontColor: "#6e707e",
//       titleFontSize: 14,
//       borderColor: "#dddfeb",
//       borderWidth: 1,
//       xPadding: 15,
//       yPadding: 15,
//       displayColors: false,
//       intersect: false,
//       mode: "index",
//       caretPadding: 10,
//       callbacks: {
//         label: function (tooltipItem, chart) {
//           var datasetLabel =
//             chart.datasets[tooltipItem.datasetIndex].label || "";
//           return datasetLabel + ": $" + number_format(tooltipItem.yLabel);
//         },
//       },
//     },
//   },
// });
