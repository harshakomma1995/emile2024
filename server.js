// Require the framework and instantiate it
const apm = require("elastic-apm-node").start({
  serviceName: "Extramile-Backend",
  serverUrl: "http://3.6.139.208:8200",
  environment: "production",
  captureBody: "all",
  logUncaughtExceptions: true,
  ignoreUserAgents: ["ELB"],
  logLevel: "off",
  transactionMaxSpans: -1,
  stackTraceLimit: Infinity
});
const APM = require("./utils/apm.js");
APM.apm = apm;

const fastify = require("fastify")();
const path = require("path");
const AutoLoad = require("@fastify/autoload");
const { PrismaClient } = require("@prisma/client");
const sgMail = require("@sendgrid/mail");
const excel = require("exceljs");
const { logger } = require("./config/logger.js");
const { BASE_URL } = require("./constants/index.js");

let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

fastify.decorate("env", require("./environment"));
fastify.decorate("logger", logger);
fastify.register(require("@fastify/formbody"));

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/public/" // optional: default '/'
});

fastify.register(require("@fastify/rate-limit"), {
  global: true,
  max: 5000,
  timeWindow: "1 minute",
  keyGenerator: (request) => {
    let requestUrl = request.raw.url;
    return (
      (request.headers["x-real-ip"] || request.headers["x-forwarded-for"]) +
      "-" +
      requestUrl +
      "-" +
      (request.headers["authorization"] || Date.now())
    );
  }
});

fastify.addHook("preHandler", async (request, reply) => {
  var objCustomLog = {
    ips: request.ips,
    query: request.query,
    params: request.params,
    body: request.body,
    appName: "Extramile Backend",
    category: "pm2",
    type: "Extramile-Backend",
    env: "development",
    servedBy: "Node (Fastify) endpoints"
  };
  apm.setTransactionName(request.method + " " + request.url);
  apm.setCustomContext(objCustomLog);
});

fastify.setErrorHandler(function (error, request, reply) {
  var statusCode = reply.statusCode;
  logger.error(
    `ERROR => SET_ERROR_HANDLER => ${request?.method + " " + request?.url} => ${error?.message || error
    }`
  );
  if (statusCode == 500) {
    reply
      .status(500)
      .send({ statusCode: 500, status: false, message: error.message });
  } else {
    reply.send(error);
    APM.apm?.captureError(error);
  }
});

// ENV
const {
  env: { SENDGRID_API_KEY }
} = fastify;
//env here
sgMail.setApiKey(SENDGRID_API_KEY);
fastify.decorate("sgMail", sgMail);
fastify.decorate("excel", excel);
fastify.decorate("prisma", prisma);
fastify.decorate("helper", require("./helper"));
fastify.decorate("services", require("./services")(fastify));

fastify.register(require("@fastify/redis"), {
  host: fastify.env.REDIS_HOST,
  password: fastify.env.REDIS_PASSWORD,
  port: 6379
});

fastify.register(require("fastify-bcrypt"), {
  saltWorkFactor: 12
});

fastify.register(require("@fastify/swagger"), {
  routePrefix: "/api/extramile/docs",
  swagger: {
    info: {
      title: "Extramile Play",
      description: "Node JS - API endpoints",
      version: "0.1.0"
    },
    externalDocs: {
      url: BASE_URL
    },
    host: BASE_URL,
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    securityDefinitions: {
      apiKey: {
        type: "apiKey",
        name: "authorization",
        in: "header"
      }
    }
  },
  exposeRoute: BASE_URL != "https://extramileplay.com/" ? true : false
});

fastify.register(require("fastify-cron"), {
  jobs: fastify.services.cronJobs
});

fastify.register(require("@fastify/cors"), {
  origin: "*"
});

// CUSTOM PLUGINS
fastify.register(AutoLoad, {
  dir: path.join(__dirname, "plugins")
});

// ROUTES
fastify.register(AutoLoad, {
  dir: path.join(__dirname, "routes"),
  options: { prefix: "/api" }
});

fastify.register(require("fastify-socket.io"));

// ON READY
fastify
  .listen({
    port: process.env.NODE_APP_INSTANCE ? 500 + process.env.NODE_APP_INSTANCE : 5000,
    host: "0.0.0.0"
  })
  .then((address) => {
    logger.info(`server listening on ${address}`);
    require("./sockets/socket")(fastify);
    fastify.cron.startAllJobs();
  })
  .catch((err) => {
    logger.info("Error starting server:", err);
    process.exit(1);
  });
