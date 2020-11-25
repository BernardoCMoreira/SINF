//line
var ctxL = document.getElementById("lineChart").getContext('2d');
var myLineChart = new Chart(ctxL, {
type: 'line',
data: {
labels: ["January", "February", "March", "April", "May", "June", "July"],
datasets: [{
label: "Cost of goods sold",
data: [1425, 1400, 1300, 1500, 1425, 1500, 1300], //17104 / 12 meses mais ou menos (variei par dar valores diferntes)
backgroundColor: [
'rgba(105, 0, 132, .2)',
],
borderColor: [
'rgba(200, 99, 132, .7)',
],
borderWidth: 2
},
{
label: "Sales",
data: [1784, 1600, 1800, 1750, 1800, 1600, 1900], //21,418 / 12 meses
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