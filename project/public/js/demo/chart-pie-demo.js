// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
var ctx = document.getElementById("myPieChart");
var top5Array = ctx.dataset.top5.split(",");
var myPieChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: [top5Array[0], top5Array[2], top5Array[4], top5Array[6], top5Array[8] ],
    datasets: [{
      data: [top5Array[1], top5Array[3], top5Array[5], top5Array[7], top5Array[9]  ],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#e74a3b',' #f6c23e'],
      hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#d50a04', '#e8b006'],
      hoverBorderColor: "rgba(234, 236, 244, 1)",
    }],
  },
  options: {
    maintainAspectRatio: false,
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      caretPadding: 10,
    },
    legend: {
      display: true
    },
    cutoutPercentage: 80,
  },
});
