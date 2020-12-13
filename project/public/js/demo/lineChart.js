//line
var ctxL = document.getElementById("lineChart").getContext("2d");

const elem = document.getElementById("lineChart");
const cogs = elem.dataset.cogs.split(',');
const sales = elem.dataset.sales.split(',');

for(cogValue in cogs) {
  cogs[cogValue] = parseFloat(cogs[cogValue]).toFixed(2);
}

for(salesValue in sales) {
  sales[salesValue] = parseFloat(sales[salesValue]).toFixed(2);
}

var myLineChart = new Chart(ctxL, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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
    scales: {
      xAxes: [
        {
          time: {
              unit: 'date'
          },
          gridLines: {
              display: false,
              drawBorder: false
          },
          ticks: {
              maxTicksLimit: 7
          }
        }
      ],
      yAxes: [
        {
          ticks: {
              maxTicksLimit: 5,
              padding: 10,
              // Include a dollar sign in the ticks
              callback: function(value, index, values) {
                  return '€' + number_format(value);
              }
          },
          gridLines: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2]
          }
        }
      ],
    },
  },
});
