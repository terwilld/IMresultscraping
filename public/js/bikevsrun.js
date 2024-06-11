var ctx = document.getElementById('myChart').getContext('2d');



axios.get("http://localhost:3000/results")
    .then(response => {
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



        var myChart = new Chart(ctx, {
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
                                style: 'bold',
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
                                style: 'bold',
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
//     type: 'line',
//     data: {
//         datasets: [
//             {
//                 label: "Switched",
//                 data: [{ x: "00:00:07", y: "00:00:00" }, { x: "00:00:14", y: "00:00:14" }, { x: "00:05:24", y: "00:05:24" }],
//                 showLine: false,
//                 fill: false,
//                 tooltip: "Player switched",
//                 borderColor: "#16a085",
//                 backgroundColor: "#16a085"
//             }
//         ]
//     },
//     options: {
//         responsive: true,
//         scales: {
//             x: {
//                 type: 'time',
//                 time: {
//                     parser: 'HH:mm:ss',
//                     unit: "seconds",
//                     tooltipFormat: 'HH:mm:ss',
//                     displayFormats: {
//                         'seconds': "HH:mm:ss"
//                     },
//                     unitStepSize: 30
//                 }
//             },
//             y: {
//                 type: 'time',
//                 time: {
//                     parser: 'HH:mm:ss',
//                     unit: "seconds",
//                     tooltipFormat: 'HH:mm:ss',
//                     displayFormats: {
//                         'seconds': "HH:mm:ss"
//                     },
//                     unitStepSize: 30
//                 }
//             }
//         }
//     }
// });
