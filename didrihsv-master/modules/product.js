"use strict";

const sqlite = require("sqlite-async");

module.exports = class Product {
  constructor(dbName = ":memory:") {
    return (async () => {
      this.db = await sqlite.open(dbName);
      // we need this table to store the user accounts
      const sql =
        "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, productName VARCHAR(255), price DECIMAL(13,2), image VARCHAR(255), description TEXT, sellingStatus VARCHAR(255), sellerName VARCHAR(255));";
      await this.db.run(sql);
      return this;
    })();
  }

  // get product
  async getProducts() {
    try {
      const sql = `SELECT * FROM products`;
      const data = await this.db.all(sql);
      return data;
    } catch (err) {
      throw err;
    }
  }

  // module to add product
  async addProduct(
    productName,
    price,
    image,
    description,
    sellingStatus,
    sellerName
  ) {
    try {
      if (productName.length === 0) throw new Error("missing productName");
      if (price.length === 0) throw new Error("missing price");
      if (image.length === 0) throw new Error("missing image");
      if (description.length === 0) throw new Error("missing description");
      if (sellingStatus.length === 0) throw new Error("missing sellingStatus");
      if (sellerName.length === 0) throw new Error("missing sellerName");

      let sql = `SELECT COUNT(id) as records FROM products WHERE productName="${productName}";`;
      const data = await this.db.get(sql);
      if (data.records !== 0)
        throw new Error(`productName "${productName}" already in use`);
      sql = `INSERT INTO products(productName, price, image, description, sellingStatus, sellerName) VALUES("${productName}", "${price}", "${image}", "${description}", "${sellingStatus}", "${sellerName}")`;
      const result = await this.db.run(sql);
      return result.lastID;
    } catch (err) {
      throw err;
    }
  }
  async updateProduct(
    product_id,
    productName,
    price,
    image,
    description,
    sellingStatus,
    sellerName
  ) {
    try {
      if (product_id.length === 0) throw new Error("missing id");
      if (productName.length === 0) throw new Error("missing productName");
      if (price.length === 0) throw new Error("missing price");
      // if (image.length === 0) throw new Error("missing image");
      if (description.length === 0) throw new Error("missing description");
      if (sellingStatus.length === 0) throw new Error("missing sellingStatus");
      if (sellerName.length === 0) throw new Error("missing sellerName");

      let sql = `UPDATE products SET productName="${productName}",price="${price}"${
        image ? "," + "image=" + image : ""
      },description="${description}",sellingStatus="${sellingStatus}",sellerName="${sellerName}" WHERE id="${product_id}"`;
      console.log(sql);
      const result = await this.db.run(sql);

      return result;
    } catch (err) {
      throw err;
    }
  }
  async changeStatus(product_id, sellingStatus) {
    try {
      if (product_id.length === 0) throw new Error("missing product_id");
      if (sellingStatus.length === 0) throw new Error("missing sellingStatus");

      let sql = `UPDATE products SET sellingStatus="${sellingStatus}" WHERE  id="${product_id}"`;
      const result = await this.db.run(sql);

      return result;
    } catch (err) {
      throw err;
    }
  }
  async deleteProduct(id) {
    try {
      let sql = `DELETE FROM products WHERE id=${id}`;
      await this.db.run(sql);

      return true;
    } catch (err) {
      throw err;
    }
  }

  async findProduct(id) {
    try {
      let sql = `select * from products where id='${id}'`;

      const result = await this.db.get(sql);
      if (result) {
        result.image = result.image.split(",");
      }
      return result;
    } catch (err) {
      throw err;
    }
  }

  async findSellerProducts(sellerName) {
    try {
      let sql = `select * from products where sellerName='${sellerName}'`;

      const result = await this.db.all(sql);
      return result;
    } catch (err) {
      throw err;
    }
  }
  async searchProduct(searchquery) {
    try {
      let sql = `select * from products where productName LIKE '%${searchquery}%'
                                          OR   description LIKE '%${searchquery}%'`;
      const products = await this.db.all(sql);
      return products;
    } catch (err) {
      throw err;
    }
  }
};
