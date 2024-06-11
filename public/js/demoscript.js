
var ctx2 = document.getElementById('mySecondChart');
var ctx3 = document.getElementById('thirdChart').getContext('2d');
var ctx4 = document.getElementById('fourthChart').getContext('2d');

var stars = [135850, 52122, 148825, 16939, 9763];
var frameworks = ['React', 'Angular', 'Vue', 'Hyperapp', 'Omi'];

function compareNumbers(a, b) {
    return a - b;
}
console.log(axiosURL)
axios.get("http://localhost:3000/results")
//axios.get(axiosURL + "/results")
    .then(response => {
        data = response.data;
        console.log(`Data length pre filter: ${data.length}`)
        data = data.filter(function (obj) {
            return obj.totalTimeSeconds != 0;
        })
        console.log(`Data length post filter: ${data.length}`)
        var overallRank = data.map((x) => x.overallRank)
        var totalTimeSeconds = data.map((x) => x.totalTimeSeconds)
        var totalTime = data.map((x) => x.totalTime)
        totalTimeSeconds.sort(compareNumbers)
        rank = []
        for (let i = 0; i < totalTimeSeconds; i++) {
            rank.push(i)
        }
        var myChart2 = new Chart(ctx2, {
            type: "line",
            data: {
                labels: overallRank,
                datasets: [
                    {
                        label: "Rank vs Time in seconds",
                        data: totalTimeSeconds,
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        borderWidth: 1,
                        fill: false,
                        lineTension: .5
                    }

                ]

            }
        });

        var myChart3 = new Chart(ctx3, {
            type: "line",
            data: {
                labels: overallRank,
                datasets: [
                    {
                        label: "Rank vs Time in seconds",
                        data: totalTimeSeconds,
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        borderWidth: 1,
                        fill: false,
                        lineTension: .5
                    }

                ]

            }
        });
        data = response.data;
        console.log(data[0])
        console.log(`Data length pre filter: ${data.length}`)
        data = data.filter(function (obj) {
            return obj.totalTimeSeconds != 0;
        })
        console.log(`Data legnth post filter: ${data.length}`)
        //const bikeVsRunData = data.map((x) => ({ 'x': x.bikeTime, 'y': x.runTime }))
        const maleBikeVsRunData = data
            .filter((result) => result.isMale == true)
            .map((x) => ({ 'x': x.bikeTime, 'y': x.runTime }))
        const femaleBikeVsRunData = data
            .filter((result) => result.isMale == false)
            .map((x) => ({ 'x': x.bikeTime, 'y': x.runTime }))


        var myChart4 = new Chart(ctx4, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: `Male (${maleBikeVsRunData.length})`,
                        data: maleBikeVsRunData,
                        //data: [{ x: "00:00:07", y: "00:00:00" }, { x: "00:00:14", y: "00:00:14" }, { x: "00:05:24", y: "00:05:24" }],
                        showLine: false,
                        fill: false,
                        //tooltip: "Player switched",
                        borderColor: "blue",
                        backgroundColor: "blue",
                        pointRadius: 1.5
                    },
                    {
                        label: `Female (${femaleBikeVsRunData.length})`,
                        data: femaleBikeVsRunData,
                        showLine: false,
                        fill: false,
                        borderColor: "red",
                        backgroundColor: "red",
                        pointRadius: 1.5
                    }

                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            align: 'center',
                            text: "Elapsed Bike Time",
                            padding: 8,
                            font: {
                                size: 24,
                                //style: 'bold',
                                family: 'Roboto',
                                fontColor: 'black'
                            }
                        },
                        ticks: {
                            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                            callback: function (val, index) {
                                // Hide every 2nd tick label
                                return index % 4 === 0 ? this.getLabelForValue(val) : '';
                            },
                            color: 'black',
                        },
                        type: 'time',
                        time: {
                            parser: 'HH:mm:ss',
                            unit: "seconds",
                            tooltipFormat: 'HH:mm:ss',
                            displayFormats: {
                                'seconds': "HH:mm:ss"
                            },
                            unitStepSize: 30000,
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            align: 'center',
                            text: "Elapsed Run Time",
                            padding: 8,
                            font: {
                                size: 24,
                                //style: 'bold',
                                family: 'Roboto',
                                fontColor: 'black'
                            }
                        },
                        ticks: {
                            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                            callback: function (val, index) {
                                // Hide every 2nd tick label
                                return index % 3 === 0 ? this.getLabelForValue(val) : '';
                            },
                            color: 'black',
                        },
                        type: 'time',
                        time: {
                            parser: 'HH:mm:ss',
                            unit: "seconds",
                            tooltipFormat: 'HH:mm:ss',
                            displayFormats: {
                                'seconds': "HH:mm:ss"
                            },
                            unitStepSize: 30000
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                label = 'FUCK'
                                return label;
                            }
                        }
                    }
                }


            }
        });


    })


// var myChart = new Chart(ctx, {
//     type: "line",
//     data: {
//         labels: frameworks,
//         datasets: [
//             {
//                 label: "Github Stars",
//                 data: stars,
//                 backgroundColor: "rgba(255, 99, 132, 0.2)",
//                 borderColor: "rgba(255, 99, 132, 1)",
//                 borderWidth: 1,
//                 fill: false,
//                 lineTension: .5
//             }

//         ]

//     }
// });