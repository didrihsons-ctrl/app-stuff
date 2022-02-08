const Product = require("../modules/product");

describe("add Product", () => {
  test("add a new valid Product", async (done) => {
    expect.assertions(1);
    const product = await new Product();
    const productId = await product.addProduct(
      "canvas by da vinci 16x14",
      "2900",
      "image3.png",
      "painted by da vinci himself",
      "for sale",
      "davinci",
      "123456789"
    );
    expect(productId).toBeDefined();
    done();
  });

  test("rejects a duplicate Product", async (done) => {
    const product = await new Product();
    await product.addProduct(
      "canvas by de niro 12x14",
      "1200",
      "image.png",
      "painted by de niro",
      "for sale",
      "deneiro",
      "123456789"
    );
    await expect(
      product.addProduct(
        "canvas by de niro 12x14",
        "1200",
        "image.png",
        "painted by de niro",
        "for sale",
        "deneiro",
        "123456789"
      )
    ).rejects.toEqual(
      Error('productName "canvas by de niro 12x14" already in use')
    );

    done();
  });

  test("error if blank product name", async (done) => {
    const product = await new Product();
    await expect(
      product.addProduct(
        "",
        "1200",
        "image.png",
        "painted by de niro",
        "for sale",
        "deneiro",
        "123456789"
      )
    ).rejects.toEqual(Error("missing productName"));
    done();
  });
  test("error if blank product price", async (done) => {
    const product = await new Product();
    await expect(
      product.addProduct(
        "canvas by de niro 12x14",
        "",
        "image.png",
        "painted by de niro",
        "for sale",
        "deneiro",
        "123456789"
      )
    ).rejects.toEqual(Error("missing price"));
    done();
  });

  test("update a product with valid data", async (done) => {
    const product = await new Product();
    const id = await product.addProduct(
      "canvas2 by de niro 12x14",
      "1200",
      "image.png",
      "painted by de niro",
      "for sale",
      "deneiro",
      "123456789"
    );
    const result = await product.updateProduct(
      id,
      "canvas2 by de niro 12x14",
      "1000",
      "image.png",
      "painted by de niro",
      "for sale",
      "deneiro",
      "123456789"
    );
    expect(result.changes).toBeGreaterThanOrEqual(1);
    done();
  });

  test("delete a product", async (done) => {
    const product = await new Product();
    const id = await product.addProduct(
      "canvas2 by de niro 12x14",
      "1200",
      "image.png",
      "painted by de niro",
      "for sale",
      "deneiro",
      "123456789"
    );

    const result = await product.deleteProduct(id);
    expect(result).toBe(true);
    done();
  });

  test("search a product", async (done) => {
    const product = await new Product();
    const id = await product.addProduct(
      "canvas2 by de niro 12x14",
      "1200",
      "image.png",
      "painted by de niro",
      "for sale",
      "deneiro",
      "123456789"
    );
    const data = await product.searchProduct("niro");
    expect(data).toEqual([
      {
        id: 1,
        productName: "canvas2 by de niro 12x14",
        price: 1200,
        image: "image.png",
        description: "painted by de niro",
        sellingStatus: "for sale",
        sellerName: "deneiro",
        sellerPhone: "123456789",
      },
    ]);

    done();
  });
});
