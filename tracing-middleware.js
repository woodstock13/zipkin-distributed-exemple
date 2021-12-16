const {
    Tracer,
    BatchRecorder,
    ConsoleRecorder,
    jsonEncoder: {JSON_V2}
} = require('zipkin');
const CLSContext = require('zipkin-context-cls');
const {HttpLogger} = require('zipkin-transport-http');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

module.exports = class TracingMiddleware {
    ZIPKIN_SERVER_URL = process.env.ZIPKIN_URL || `http://localhost:9411/api/v1/spans`
    localServiceName = "service-test"
    remoteService = "remote-service"
    current_tracer

    constructor(_localServiceName) {
        this.localServiceName = _localServiceName
        this.current_tracer = this.initializeTracer()
    }

    initializeMiddleware(app) {
        app.use(zipkinMiddleware({tracer: this.current_tracer}));
        app.use(this.middlewareFunction);
    }

    initializeTracer() {
        const ctxImpl = new CLSContext();
        const recorder = new BatchRecorder({
            logger: new HttpLogger({
                endpoint: `${this.ZIPKIN_SERVER_URL}`,
                // jsonEncoder: JSON_V2,
                // headers: { ["test"]: "toto" },
                // log: noop
            })
        });
        // const recorder = new ConsoleRecorder() // enable for debugging
        this.tracer = new Tracer({ctxImpl, recorder, localServiceName: this.localServiceName})
        return this.tracer;
    }

    middlewareFunction(req, res, next) {
        res.header(`traceId`, (
            (req && req._trace_id)
                ? req._trace_id.traceId
                :`No Trace id`
        ));
        // res.header(`resp-body`, (
        //     (req && req._trace_id && res.data)
        //         ? res.data
        //         :`No response`
        // ));
        next();
    }
}
