//line
var ctxL = document.getElementById("lineChart").getContext("2d");

const elem = document.getElementById("lineChart");
const cogs = elem.getAttribute("data-cogs");
const sales = elem.getAttribute("data-sales");

var myLineChart = new Chart(ctxL, {
  type: "line",
  data: {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Cost of goods sold",
        data: cogs, //17104 / 12 meses mais ou menos (variei par dar valores diferntes)
        backgroundColor: ["rgba(105, 0, 132, .2)"],
        borderColor: ["rgba(200, 99, 132, .7)"],
        borderWidth: 2,
      },
      {
        label: "Sales",
        data: sales, //21,418 / 12 meses
        backgroundColor: ["rgba(0, 137, 132, .2)"],
        borderColor: ["rgba(0, 10, 130, .7)"],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
  },
});
