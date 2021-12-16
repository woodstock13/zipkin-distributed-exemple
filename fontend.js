const {logger} = require('./logger');
const {
    Tracer,
    ExplicitContext,
    ConsoleRecorder
} = require('zipkin');
const proxy = require('express-http-proxy');
const {expressMiddleware, wrapExpressHttpProxy} = require('zipkin-instrumentation-express')
const wrapFetch = require('zipkin-instrumentation-fetch');
const TracingMiddleware = require("./tracing-middleware");



const express = require('express')
const fetch = require('node-fetch')
const zipkin = require("zipkin");
const app = express()
const port = 3001

// #1 - Setup the tracer
// new TracingMiddleware('front').initializeMiddleware(app)

// #2 - zipkin express proxy way NOTE working deprecated version
// const ctxImpl = new ExplicitContext();
// const recorder = new ConsoleRecorder();
// const tracer = new Tracer({ctxImpl, localServiceName: 'front', recorder});
//
// const remoteServiceName = 'back';
// const zipkinProxy = wrapExpressHttpProxy(proxy, {tracer, remoteServiceName});
//
// app.use('/proxy', expressMiddleware({tracer}), zipkinProxy('http://localhost:3000/api', {
//     proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
//         return new Promise(function(resolve, reject) {
//             proxyReqOpts.headers['Content-Type'] = 'text/html';
//             resolve(proxyReqOpts);
//         })
//     }
// }));

// #3 - zipkin with fetch
const localZipkin = new TracingMiddleware('front');
localZipkin.initializeMiddleware(app)
// first part like #1 and next connect the call
const remoteServiceName = 'back';
const zipkinFetch = wrapFetch(fetch, {tracer: localZipkin.initializeTracer(), remoteServiceName});

app.get('/test-simple', (req, res) => {
    logger.log('info', 'Hello distributed log files!',
        { 'serviceName':'frontend', 'TraceId': res.get("traceId") || req.header('X-B3-TraceId'), 'SpanId': req.header('X-B3-SpanId') });
    res.send(new Date().toString())
});
app.get('/test-redirection', (req, res) => {
    logger.log('info', 'Hello distributed log files!',
        { 'serviceName':'frontend', 'TraceId': res.get("traceId") || req.header('X-B3-TraceId'), 'SpanId': req.header('X-B3-SpanId') });
    res.send(new Date().toString())
});
app.get('/', (req, res) => {
    zipkinFetch('http://localhost:3000/api')
        .then(response => {
            const traceIdValue = response.headers.get('trace_id')
            const spanIdValue = response.headers.get('trace_id')

            logger.log('info', 'Hello distributed log files!',
                { 'serviceName':'frontend', 'TraceId': traceIdValue, 'SpanId': spanIdValue });
            res.send({message: response});
        })
        .catch(err => logger.error('Error', err.stack))
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
