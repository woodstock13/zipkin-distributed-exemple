const winston = require('winston'), moment = require('moment');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            formatter: (options) => {

                const traceId = options.meta.TraceId;
                const spanId = options.meta.SpanId;
                const service = options.meta.serviceName;
                const logLevel = options.level.toUpperCase();
                const time = moment();
                const message = options.message || '';
                return JSON.stringify({
                    timestamp: time.toISOString(),
                    logLevel,
                    message,
                    traceId,
                    spanId,
                    service
                });
            }
        }),
        new winston.transports.File({
            filename: 'frontend.log',
            formatter: (options) => {
                const traceId = options.meta.TraceId;
                const spanId = options.meta.SpanId;
                const service = options.meta.serviceName;
                const logLevel = options.level.toUpperCase();
                const time = moment();
                const message = options.message || '';
                return JSON.stringify({
                    timestamp: time.toISOString(),
                    logLevel,
                    message,
                    traceId,
                    spanId,
                    service
                });
            }
        })
    ]
});
module.exports.logger = logger;
