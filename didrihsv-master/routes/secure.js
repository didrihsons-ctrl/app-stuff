const Router = require("koa-router");
const multer = require("@koa/multer");
const koaBody = require("koa-body")({
  multipart: true,
});
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AbEE3BeFX9UHr3LeB2nOHTOdNo0W0-VkY_HLS2ZXfPRnB0KRugsl_WTCCKlP0gJFgJCbDd-nHaejht3C",
  client_secret:
    "EAMsZym_w8iAHZeqG0GIt0OQLJYJhAsTFiRqEDeQbKQ4ZIv26nBdaxidR6cpWM78weFRJYEoE0vppKWB",
});
const PROJECT_URL = "http://localhost:8080";

const router = new Router({ prefix: "/secure" });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "." + file.originalname.split(".").pop());
  },
});

const dbName = "website.db";
const Product = require("../modules/product");
const Orders = require("../modules/orders");
const Users = require("../modules/user");
const { buyerEmail, sellerEmail } = require("../public/functions");
const upload = multer({ storage: storage });

router.get("/", async (ctx) => {
  try {
    console.log(ctx.hbs);
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");

    const info = {};
    info.logged = true;
    info.username = ctx.session.username;
    info.sellerName = ctx.session.username;

    const products = await new Product(dbName);
    const data = await products.findSellerProducts(ctx.session.username);
    console.log(data);

    await ctx.render("seller", { data, info });
  } catch (err) {
    console.log(err);
    ctx.hbs.error = err.message;
    await ctx.render("error", ctx.hbs);
  }
});

router.get("/addProduct", async (ctx) => {
  try {
    console.log(ctx.hbs);
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");
    await ctx.render("addProduct", ctx.hbs);
  } catch (err) {
    ctx.hbs.error = err.message;
    await ctx.render("error", ctx.hbs);
  }
});

// api endpoint for adding product
router.post("/addProduct", upload.array("productImage", 1), async (ctx) => {
  try {
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");
    let imagespaths = [];
    let files = ctx.request.files;
    files.forEach((item) => {
      imagespaths.push(item.filename);
    });
    console.log(imagespaths);

    const body = ctx.request.body;
    const product = await new Product(dbName);
    const productId = await product.addProduct(
      body.productName,
      body.price,
      imagespaths[0],
      body.description,
      "for sale",
      ctx.session.username
    );
    return ctx.redirect(`/secure`);
  } catch (err) {
    ctx.hbs.error = err.message;
    console.log(err);
    await ctx.render("error", ctx.hbs);
  }
});

router.get("/product/:id", async (ctx) => {
  try {
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");

    const products = await new Product(dbName);
    const data = await products.findProduct(ctx.params.id);
    console.log(data);

    await ctx.render("editProduct", { data });
  } catch (err) {
    await ctx.render("error", { message: err.message });
  }
});

// api endpoint for editing product
router.post("/editProduct", upload.array("productImage", 1), async (ctx) => {
  try {
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");
    let imagespaths = [];
    let files = ctx.request.files;
    files.forEach((item) => {
      imagespaths.push(item.filename);
    });
    console.log(imagespaths);

    const body = ctx.request.body;
    console.log(body);
    const product = await new Product(dbName);
    const productId = await product.updateProduct(
      body.productId,
      body.productName,
      body.price,
      imagespaths[0],
      body.description,
      body.sellingStatus,
      ctx.session.username
    );
    return ctx.redirect(`/secure`);
  } catch (err) {
    ctx.hbs.error = err.message;
    console.log(err);
    await ctx.render("error", ctx.hbs);
  }
});

// api endpoint for deleting product
router.post("/deleteProduct", koaBody, async (ctx) => {
  try {
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");

    const body = ctx.request.body;
    console.log(ctx.request, body);
    const product = await new Product(dbName);
    const productId = await product.deleteProduct(body.productId);
    return ctx.redirect(`/secure`);
  } catch (err) {
    ctx.hbs.error = err.message;
    console.log(err);
    await ctx.render("error", ctx.hbs);
  }
});

router.get("/account", async (ctx) => {
  try {
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");

    const user = await new Users(dbName);
    const data = await user.getDetails(ctx.session.userId);
    await ctx.render("account", { data });
  } catch (err) {
    await ctx.render("error", { message: err.message });
  }
});

router.post("/editAccount", koaBody, async (ctx) => {
  try {
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");

    const body = ctx.request.body;
    console.log(body);
    const user = await new Users(dbName);
    await user.updateAccountDetails(
      body.userId,
      body.email,
      body.phone,
      body.address
    );
    await ctx.redirect("/secure/account?msg=account details updated");
  } catch (err) {
    await ctx.render("error", { message: err.message });
  }
});

router.post("/pay", koaBody, async (ctx) => {
  try {
    if (ctx.hbs.authorised !== true)
      return ctx.redirect("/login?msg=you need to log in&referrer=/secure");

    const body = ctx.request.body;
    const products = await new Product(dbName);
    const data = await products.findProduct(body.productId);

    console.log(data);

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${PROJECT_URL}/secure/pay_success`,
        cancel_url: `${PROJECT_URL}/secure/pay_cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: data.productName,
                price: `${data.price}.00`,
                currency: "EUR",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "EUR",
            total: `${data.price}.00`,
          },
          description: data.description,
        },
      ],
    };

    console.log(create_payment_json);

    return new Promise((resolve, reject) => {
      paypal.payment.create(create_payment_json, async (error, payment) => {
        if (error) {
          throw error;
        } else {
          try {
            const order = await new Orders(dbName);

            const user = await new Users(dbName);
            const buyerDetails = await user.getDetails(ctx.session.userId);
            const sellerDetails = await user.getDetails(ctx.session.userId); //!!!!

            console.log(
              buyerDetails,
              sellerDetails,
              ctx.session.userId,
              payment.id,
              data.id
            );

            await order.addOrder(
              JSON.stringify(create_payment_json),
              payment.id,
              data.id,
              JSON.stringify(buyerDetails),
              JSON.stringify(sellerDetails),
              JSON.stringify(data)
            );

            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === "approval_url") {
                resolve(payment.links[i].href);
              }
            }
          } catch (err) {
            throw err;
          }
        }
      });
    }).then((url) => {
      return ctx.redirect(url);
    });
  } catch (err) {
    console.log(err);
    await ctx.render("error", { message: err.message });
  }
});

router.get("/pay_success", async (ctx) => {
  try {
    const payerId = ctx.query.PayerID;
    const paymentId = ctx.query.paymentId;

    const order = await new Orders(dbName);
    const {
      productId,
      orderDetails,
      buyerDetails,
      sellerDetails,
      productDetails,
    } = await order.findOrder(paymentId);

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [{ amount: orderDetails.transactions[0].amount }],
    };

    return new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, execute_payment_json, async function (
        error,
        payment
      ) {
        if (error) {
          console.log(error);
        } else {
          try {
            const product = await new Product(dbName);
            await product.changeStatus(productId, "under offer");

            await buyerEmail({ buyerDetails, sellerDetails, productDetails });
            await sellerEmail({ buyerDetails, sellerDetails, productDetails });
            resolve();
          } catch (e) {
            console.log(e);
          }
        }
      });
    }).then(() => {
      return ctx.redirect("/?msg=success");
    });
  } catch (err) {
    console.log(err);
    await ctx.render("error", { message: err.message });
  }
});

module.exports = router;
