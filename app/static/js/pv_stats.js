"use strict";

const lastUpdateText = document.getElementById("lastUpdate");

const latestPowerText = document.getElementById("latestPower");
const peakValueText = document.getElementById("peakValue");

const dayEnergyText = document.getElementById("dayEnergy");
const monthEnergyText = document.getElementById("monthEnergy");
const yearEnergyText = document.getElementById("yearEnergy");
const totalEnergyText = document.getElementById("totalEnergy");

const monthIncentivesText = document.getElementById("monthIncentives");
const yearIncentivesText = document.getElementById("yearIncentives");

const daysActivityText = document.getElementById("daysActivity");
const yearsActivityText = document.getElementById("yearsActivity");

const updateStats = function () {
  $.ajax({
    type: "GET",
    url: `/stats`,
    dataType: "json",
    success: function (result) {
      lastUpdateText.textContent = `Aggiornato ${new Date(
        result.latest_date
      ).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}`;

      latestPowerText.textContent = result.latest_power;
      peakValueText.textContent = result.peak_value;

      dayEnergyText.textContent = (result.day_energy / 1000).toFixed(1);
      monthEnergyText.textContent = (result.month_energy / 1000).toFixed(1);

      yearEnergyText.textContent = Math.round(result.year_energy / 1000);
      totalEnergyText.textContent = Math.round(result.total_energy / 1000);

      monthIncentivesText.textContent = result.month_incentives.toFixed(2);
      yearIncentivesText.textContent = result.year_incentives.toFixed(2);

      const daysPassed = result.operating_days;
      const yearsPassed = Math.floor(daysPassed / 365);
      const monthsPassed = Math.floor((daysPassed % (yearsPassed * 365)) / 30);
      daysActivityText.textContent = `${daysPassed}g`;
      yearsActivityText.textContent = `${yearsPassed}a ${monthsPassed}m`;
    },
  });
};

updateStats();

const refreshStatsBtn = document.getElementById("refreshStats");

refreshStatsBtn.addEventListener("click", function () {
  updateStats();
});
