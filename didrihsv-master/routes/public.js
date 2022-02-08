const Router = require("koa-router");
const koaBody = require("koa-body")({ multipart: true, uploadDir: "." });
const router = new Router();

const dbName = "website.db";
const User = require("../modules/user");
const Product = require("../modules/product");

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get("/", async (ctx) => {
  try {
    const info = {};
    console.log(ctx.session.authorised);
    if (ctx.session.authorised) info.logged = true;
    const products = await new Product(dbName);
    const data = await products.getProducts();
    data.forEach((item) => {
      item.image = item.image.split(",")[0];
    });
    console.log(data);

    await ctx.render("index", { data, info });
  } catch (err) {
    await ctx.render("error", { message: err.message });
  }
});

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get("/register", async (ctx) => await ctx.render("register"));

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post("/register", koaBody, async (ctx) => {
  const user = await new User(dbName);
  try {
    // call the functions in the module
    await user.register(
      ctx.request.body.user,
      ctx.request.body.pass,
      ctx.request.body.email,
      ctx.request.body.phone,
      ctx.request.body.address
    );
    ctx.redirect(
      `/login?msg=new user "${ctx.request.body.user}" added, you need to log in`
    );
  } catch (err) {
    ctx.hbs.msg = err.message;
    ctx.hbs.body = ctx.request.body;
    console.log(ctx.hbs);
    await ctx.render("register", ctx.hbs);
  } finally {
    user.tearDown();
  }
});

router.get("/postregister", async (ctx) => await ctx.render("validate"));

router.get("/validate/:user/:token", async (ctx) => {
  try {
    console.log("VALIDATE");
    console.log(`URL --> ${ctx.request.url}`);
    if (!ctx.request.url.includes(".css")) {
      console.log(ctx.params);
      const milliseconds = 1000;
      const now = Math.floor(Date.now() / milliseconds);
      const user = await new User(dbName);
      await user.checkToken(ctx.params.user, ctx.params.token, now);
      ctx.hbs.msg = `account "${ctx.params.user}" has been validated`;
      await ctx.render("login", ctx.hbs);
    }
  } catch (err) {
    await ctx.render("login", ctx.hbs);
  }
});

router.get("/login", async (ctx) => {
  console.log(ctx.hbs);
  await ctx.render("login", ctx.hbs);
});

router.post("/login", koaBody, async (ctx) => {
  const users = await new User(dbName);
  ctx.hbs.body = ctx.request.body;
  try {
    const body = ctx.request.body;
    const user = await users.login(body.user, body.pass);
    ctx.session.authorised = true;
    ctx.session.username = user.user;
    ctx.session.userId = user.id;

    console.log(ctx.session);
    const referrer = body.referrer || "/";
    return ctx.redirect(`${referrer}?msg=you are now logged in...`);
  } catch (err) {
    ctx.hbs.msg = err.message;
    await ctx.render("login", ctx.hbs);
  } finally {
    users.tearDown();
  }
});

router.get("/logout", async (ctx) => {
  ctx.session.authorised = null;
  ctx.redirect("/?msg=you are now logged out");
});

router.get("/product/:id", async (ctx) => {
  try {
    const info = {};
    console.log(ctx.session.authorised);
    if (ctx.session.authorised) info.logged = true;
    const products = await new Product(dbName);
    const data = await products.findProduct(ctx.params.id);
    data.buyable = data.sellingStatus !== "sold";
    console.log(data);

    await ctx.render("product", { data, info });
  } catch (err) {
    await ctx.render("error", { message: err.message });
  }
});

router.get("/seller/:sellerName", async (ctx) => {
  try {
    const info = {};
    console.log(ctx.session.authorised);
    if (ctx.session.authorised) info.logged = true;
    if (ctx.session.authorised) info.username = ctx.session.username;
    info.sellerName = ctx.params.sellerName;
    const products = await new Product(dbName);
    const data = await products.findSellerProducts(ctx.params.sellerName);
    console.log(data);

    await ctx.render("seller", { data, info });
  } catch (err) {
    console.log(err);
    ctx.hbs.error = err.message;
    await ctx.render("error", ctx.hbs);
  }
});

router.get("/search/:query", async (ctx) => {
  try {
    const searchquery = ctx.params.query;
    const products = await new Product(dbName);
    const data = await products.searchProduct(searchquery);
    await ctx.render("searchProducts", data);
  } catch (err) {
    await ctx.render("error", { message: err.message });
  }
});

module.exports = router;
