const Router = require("koa-router");

const publicRouter = require("./public");
const secureRouter = require("./secure");
// const homeRouter = require("./home");

const apiRouter = new Router();

const nestedRoutes = [publicRouter, secureRouter];
for (const router of nestedRoutes)
  apiRouter.use(router.routes(), router.allowedMethods());

module.exports = apiRouter;
