const Router = require("koa-router");
const router = new Router();

const dbName = "website.db";

const Product = require("../modules/product");

router.get("/", async (ctx) => {
  console.log("hit");
  try {
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in");

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

module.exports = router;
