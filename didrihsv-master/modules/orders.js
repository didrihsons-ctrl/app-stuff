"use strict";

const sqlite = require("sqlite-async");

module.exports = class Order {
  constructor(dbName = ":memory:") {
    return (async () => {
      this.db = await sqlite.open(dbName);
      // we need this table to store the user accounts
      const sql =
        "CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, orderDetails TEXT, paymentId NUMERIC, productId VARCHAR(255), buyerDetails TEXT, sellerDetails TEXT, productDetails TEXT);";
      await this.db.run(sql);
      return this;
    })();
  }

  // get product
  async getOrders() {
    try {
      const sql = `SELECT * FROM orders`;
      const data = await this.db.all(sql);
      return data;
    } catch (err) {
      throw err;
    }
  }

  // module to add product by admin
  async addOrder(
    orderDetails,
    paymentId,
    productId,
    buyerDetails,
    sellerDetails,
    productDetails
  ) {
    try {
      if (orderDetails.length === 0) throw new Error("missing orderDetails");
      if (paymentId.length === 0) throw new Error("missing paymentId");
      if (productId.length === 0) throw new Error("missing productId");
      if (buyerDetails.length === 0) throw new Error("missing buyerDetails");
      if (sellerDetails.length === 0) throw new Error("missing sellerDetails");
      if (productDetails.length === 0)
        throw new Error("missing productDetails");

      let sql = `INSERT INTO orders(orderDetails, paymentId, productId, buyerDetails, sellerDetails, productDetails) VALUES('${orderDetails}', '${paymentId}', '${productId}', '${buyerDetails}', '${sellerDetails}', '${productDetails}')`;
      console.log(sql);
      const result = await this.db.run(sql);
      console.log(result);
      return result.lastID;
    } catch (err) {
      throw err;
    }
  }

  async findOrder(paymentId) {
    try {
      let sql = `select * from orders where paymentId='${paymentId}'`;
      const result = await this.db.get(sql);
      return { ...result, orderDetails: JSON.parse(result.orderDetails) };
    } catch (err) {
      throw err;
    }
  }
};
