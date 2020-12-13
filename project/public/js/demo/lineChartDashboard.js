//line
var ctxL = document.getElementById("lineChartDashboard");
var arrays = ctxL.dataset.salespurchases.split(",");
var graph1 = [];
var graph2 = [];
for (let i = 0; i < arrays.length / 2; i++) {
    graph1.push(parseFloat(arrays[i]));
}
for (let j = arrays.length / 2; j < arrays.length; j++) {
    graph2.push(parseFloat(arrays[j]));
}

var myLineChart = new Chart(ctxL, {
    type: 'line',
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
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
        responsive: true
    }
});