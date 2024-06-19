
var ctx = document.getElementById('stackedBar');
const labels = ['A']
const newdata = {
    labels: labels,
    datasets: [
        {
            label: 'Dataset 1',
            data: ['01:00:00'],
            // data: [100],
            backgroundColor: 'red',
        },
        {
            label: 'Dataset 2',
            // data: [100],
            data: ['01:00:00'],
            backgroundColor: 'blue',
        },
        {
            label: 'Dataset 3',
            // data: [100],
            data: ['01:00:00'],
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

        scales: {
            x: {

                stacked: true,
                // offset: true

            },
            y: {
                min: '00:00:00',
                max: '21:50:00',
                //stacked: true,
                // offset: true,
                // stacked: true,
                type: 'time',
                time: {
                    parser: 'HH:mm:ss',
                    unit: "hour",
                    tooltipFormat: 'HH:mm:ss',
                    displayFormats: {
                        'seconds': "HH:mm:ss"
                    }
                    //unitStepSize: 30000
                },
                ticks: {
                    //For a category axis, the val is the index so the lookup via getLabelForValue is needed
                    callback: function (val, index) {
                        // Hide every 2nd tick label
                        return index % 2 === 0 ? this.getLabelForValue(val) : '';
                    },
                    color: 'black',
                },
            }
        }
    }
};
var myChart6 = new Chart(ctx, config)
var ctx = document.getElementById('stackedBar');