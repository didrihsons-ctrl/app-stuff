const nodemailer = require("nodemailer");

const PROJECT_NAME = "Art Gallery";
const PROJECT_EMAIL = "";
const NODEMAILER_PASSWORD = "";
const PROJECT_ORIGIN = "http://localhost:8080";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: PROJECT_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
});

const sellerEmail = ({ buyerDetails, sellerDetails, productDetails }) => {
  const _buyerDetails = JSON.parse(buyerDetails);
  const _sellerDetails = JSON.parse(sellerDetails);
  const _productDetails = JSON.parse(productDetails);

  const mailOptions = {
    from: PROJECT_EMAIL,
    to: _sellerDetails.email,
    subject: "You've got new order request",
    text: `Dear ${_sellerDetails.user},
You've got a new order request of ${_productDetails.productName} for ${PROJECT_NAME}.

Buyer Details:
Name: ${_buyerDetails.user}
Email: ${_buyerDetails.email}
Phone: ${_buyerDetails.phone}
Address: ${_buyerDetails.address}

Here is the link of your original art piece.
${PROJECT_ORIGIN}/product/${_productDetails.productId}/
    
Thankyou,
The ${PROJECT_NAME} Team`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });
};

const buyerEmail = ({ buyerDetails, sellerDetails, productDetails }) => {
  const _buyerDetails = JSON.parse(buyerDetails);
  const _sellerDetails = JSON.parse(sellerDetails);
  const _productDetails = JSON.parse(productDetails);

  const mailOptions = {
    from: PROJECT_EMAIL,
    to: _buyerDetails.email,
    subject: "You've got new order request",
    text: `Dear ${_buyerDetails.user},
You've got a new order request of ${_productDetails.productName} for ${PROJECT_NAME}.

Seller Details:
Name: ${_sellerDetails.user}
Email: ${_sellerDetails.email}
Phone: ${_sellerDetails.phone}

Seller will contact you soon.

Here is the link of your requested art piece.
${PROJECT_ORIGIN}/product/${_productDetails.productId}/.
If you didn't request to reset the password, you can kindly ignore this email.
    
Thankyou,
The ${PROJECT_NAME} Team`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });
};

module.exports = { sellerEmail, buyerEmail };
