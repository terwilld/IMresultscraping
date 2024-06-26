
const pino = require('pino');
const path = require('path')
const transport = pino.transport({
    targets: [
        {
            target: 'pino/file',
            options: {
                mkdir: true,
                destination: path.join(__dirname, 'logs/allLogs.log'),
            }
        },
        {
            target: 'pino/file', // logs to the standard output by default
            level: 'error',
            options: {
                mkdir: true,
                destination: path.join(__dirname, 'logs/error.log')
            }
        },
    ],
});

module.exports = pino(
    {
        level: process.env.PINO_LOG_LEVEL || 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport
);



// Pino.instance = new pino(pino.transport({
//     targets: [
//         {
//             target: 'pino/file',
//             options: {
//                 mkdir: true,
//                 destination: join(__dirname, 'logs/allLogs'),
//             },
//         },
//         {
//             target: 'pino/file',
//             level: 'error',
//             options: {
//                 mkdir: true,
//                 destination: join(__dirname, 'logs/errorLogs')
//             }
//         },
//     ]
// }))



// const pino = require('pino');

// const fileTransport = pino.transport({
//     target: 'pino/file',
//     options: { destination: `${__dirname}/app.log` },
// });

// module.exports = pino(
//     {
//         level: process.env.PINO_LOG_LEVEL || 'info',
//         formatters: {
//             level: (label) => {
//                 return { level: label.toUpperCase() };
//             },
//         },
//         timestamp: pino.stdTimeFunctions.isoTime,
//     },
//     fileTransport
// );




