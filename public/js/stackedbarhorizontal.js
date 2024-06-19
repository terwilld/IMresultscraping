// const { data } = require("cheerio/lib/api/attributes");

axios.get(axiosURL + "/results")
    .then(response => {

        data = response.data
        console.log(data)
        divisionSummary = []
        for (const result of data) {
            //console.log(result)
            if (result.designation == 'Finisher') {
                //console.log("test")
                const i = divisionSummary.findIndex(e => e.division === result.division);
                if (i > -1) {
                    // We know that at least 1 object that matches has been found at the index i
                    //console.log(i)
                    //console.log(divisionSummary)
                    divisionSummary[i].participants = divisionSummary[i].participants + 1
                    divisionSummary[i].totalSwimTime = divisionSummary[i].totalSwimTime + result.swimSeconds
                    divisionSummary[i].totalBikeTime = divisionSummary[i].totalBikeTime + result.bikeSeconds
                    divisionSummary[i].totalRunTime = divisionSummary[i].totalRunTime + result.runSeconds

                } else {
                    divisionSummary.push({
                        'division': result.division,
                        'totalSwimTime': result.swimSeconds,
                        'participants': 1,
                        'totalBikeTime': result.bikeSeconds,
                        'totalRunTime': result.runSeconds
                    })
                }
            }
        }

        for (const element of divisionSummary) {
            element.averageSwimTime = element.totalSwimTime / element.participants / 3600
            element.averageBikeTime = element.totalBikeTime / element.participants / 3600
            element.averageRunTime = element.totalRunTime / element.participants / 3600
            element.averageTotalTime = element.averageSwimTime + element.averageBikeTime + element.averageRunTime
            console.log(element);
        }
        divisionSummary.sort((a, b) => a.averageTotalTime - b.averageTotalTime);
        divisions = divisionSummary.map(({ division }) => division)
        averageSwimTimes = divisionSummary.map(({ averageSwimTime }) => averageSwimTime)
        averageBikeTimes = divisionSummary.map(({ averageBikeTime }) => averageBikeTime)
        averageRunTimes = divisionSummary.map(({ averageRunTime }) => averageRunTime)


        var ctx = document.getElementById('stackedBar');
        //const labels = ['MPRO', 'FPRO']
        const labels = divisions
        const newdata = {
            labels: labels,
            datasets: [
                {
                    label: 'Swim',
                    // data: ['01:00:00'],
                    //data: [1, 1.2],
                    data: averageSwimTimes,
                    backgroundColor: 'blue',
                },
                {
                    label: 'Bike',
                    //data: [2.5, 3],
                    data: averageBikeTimes,
                    // data: ['01:00:00'],
                    backgroundColor: 'red',
                },
                {
                    label: 'Run',
                    data: [3, 4],
                    data: averageRunTimes,
                    // data: ['01:00:00'],
                    backgroundColor: 'green',
                }
            ]
        };

        const config = {
            type: 'bar',
            data: newdata,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Chart.js Bar Chart - Stacked'
                    },
                },
                responsive: true,
                // indexAxis: 'y',
                scales: {
                    y: {
                        min: 0,
                        max: 16,
                        stacked: true,
                        offset: true

                    },
                    x: {
                        // min: '00:00:00',
                        // max: '21:50:00',
                        stacked: true,
                        offset: true,
                        // stacked: true,
                        // type: 'time',
                        // time: {
                        //     parser: 'HH:mm:ss',
                        //     unit: "hour",
                        //     tooltipFormat: 'HH:mm:ss',
                        //     displayFormats: {
                        //         'seconds': "HH:mm:ss"
                        //     }
                        //     //unitStepSize: 30000
                        // },
                        // ticks: {
                        //     //For a category axis, the val is the index so the lookup via getLabelForValue is needed
                        //     callback: function (val, index) {
                        //         // Hide every 2nd tick label
                        //         return index % 2 === 0 ? this.getLabelForValue(val) : '';
                        //     },
                        //     color: 'black',
                        // },
                    }
                }
            }
        };
        var myChart6 = new Chart(ctx, config)
        var ctx = document.getElementById('stackedBar');
    })