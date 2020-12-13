//line
var ctxL = document.getElementById("lineChartDashboard");
var arrays = ctxL.dataset.salespurchases.split(",");
var graph1 = [];
var graph2 = [];

for (let i = 0; i < arrays.length / 2; i++) {
    graph1.push(parseFloat(arrays[i]).toFixed(2));
}
for (let j = arrays.length / 2; j < arrays.length; j++) {
    graph2.push(parseFloat(arrays[j]).toFixed(2));
}

var myLineChart = new Chart(ctxL, {
    type: 'line',
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
                label: "Sales",
                data: graph1,
                backgroundColor: [
                    'rgba(105, 0, 132, .2)',
                ],
                borderColor: [
                    'rgba(200, 99, 132, .7)',
                ],
                borderWidth: 2
            },
            {
                label: "Purchases",
                data: graph2,
                backgroundColor: [
                    'rgba(0, 137, 132, .2)',
                ],
                borderColor: [
                    'rgba(0, 10, 130, .7)',
                ],
                borderWidth: 1
            }
        ]
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
    }
});