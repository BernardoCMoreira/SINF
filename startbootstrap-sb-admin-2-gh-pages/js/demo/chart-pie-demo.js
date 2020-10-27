// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
var ctx = document.getElementById("myPieChart");
var myPieChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: [" Macbook Pro 13' ", "Allienware m15", "Samsung S20+", "iPhone 12 Pro", "Xiaomi Mi 10"  ],
    datasets: [{
      data: [650, 290, 270, 258 ,120 ],
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
      display: false
    },
    cutoutPercentage: 80,
  },
});
