const {logger} = require('./logger');
const express = require('express')
const TracingMiddleware = require('./tracing-middleware')

const app = express()
const port = 3000

// Setup the tracer
new TracingMiddleware('back').initializeMiddleware(app)

app.get('/api', (req, res) => {
    console.log(req.headers)
    const traceIdValue = req.header('x-b3-traceid') || res.get("traceId")
    const spanIdValue = req.header('x-b3-spanid') || res.get("SpanId")
    logger.log('info', 'Hello distributed log files!',
        { 'serviceName':'backend', 'TraceId': traceIdValue, 'SpanId': spanIdValue });
    res.setHeader("trace_id", traceIdValue)
    res.setHeader("span_id", spanIdValue)
    res.send(new Date().toString())
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
