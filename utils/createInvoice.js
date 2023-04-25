const createInvoice = (invoice, invoiceData) => {
  generateHeader(invoice);
  generateCustomerInformation(invoice, invoiceData);
  generateShippingAddress(invoice, invoiceData);
  generateInvoiceTable(invoice, invoiceData);
  generateFooter(invoice);
};

function generateHeader(doc) {
  doc
    .image("uploads/logo.png", 50, 45, { width: 150 })
    .fillColor("#2e2e2e")
    .fontSize(10)
    .text("Growcomers Online Grocery Store", 200, 50, { align: "right" })
    .text("Growcomers Building", 200, 65, { align: "right" })
    .text("Vellore, TN, 632014", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor("#2e2e2e").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(
      new Date(invoice.orderDate).getTime().toString().substring(-6),
      150,
      customerInformationTop
    )
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(
      formatDate(new Date(invoice.orderDate)),
      150,
      customerInformationTop + 15
    )

    .fontSize(10)
    .text("Order Number:", 300, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.orderId, 400, customerInformationTop)
    .font("Helvetica")
    .text("Order Date:", 300, customerInformationTop + 15)
    .text(
      formatDate(new Date(invoice.orderDate)),
      400,
      customerInformationTop + 15
    )
    .moveDown();
  // generateHr(doc, 252);
}

function generateShippingAddress(doc, invoice) {
  doc.fillColor("#2e2e2e").fontSize(12).text("Bill To", 50, 260);

  generateHr(doc, 275);

  const customerInformationTop = 285;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(invoice.user.name, 50, customerInformationTop)
    .font("Helvetica")
    .text(invoice.address.street, 50, customerInformationTop + 15)
    .text(
      invoice.address.city +
        ", " +
        invoice.address.state +
        ", " +
        invoice.address.zipCode,
      50,
      customerInformationTop + 30
    )
    .text(invoice.address.country, 50, customerInformationTop + 45)
    .moveDown();

  //   generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let invoiceTableTop = 380;

  doc.font("Helvetica-Bold");
  doc.fontSize(9);
  generateTableRow(
    doc,
    invoiceTableTop,
    "S. No",
    "Description",
    "Unit Price",
    "Quantity",
    "Total Amount"
  );
  generateHr(doc, invoiceTableTop + 15);
  doc.font("Helvetica");

  doc.fontSize(8);
  let i = 1;
  let pastHeight = 15;
  for (const item of invoice.products) {
    invoiceTableTop += pastHeight + 10;
    generateTableRow(
      doc,
      invoiceTableTop,
      i,
      item.title,
      formatCurrency(item.price),
      item.quantity,
      formatCurrency(item.subTotal)
    );

    i++;
    pastHeight = doc.heightOfString(item.title, {
      width: 180,
    });
    invoiceTableTop += 5;
    generateHr(doc, invoiceTableTop + pastHeight);
  }

  invoiceTableTop += 30;
  doc.font("Helvetica-Bold");
  doc.fontSize(10);
  generateTableRow(
    doc,
    invoiceTableTop,
    "",
    "",
    "",
    "Total",
    formatCurrency(invoice.totalAmount)
  );

  invoiceTableTop += 20;
  generateTableRow(
    doc,
    invoiceTableTop,
    "",
    "",
    "",
    "Amount Paid",
    formatCurrency(invoice.totalAmount)
  );

  invoiceTableTop += 20;
  generateTableRow(
    doc,
    invoiceTableTop,
    "",
    "",
    "",
    "Amount Due",
    formatCurrency(0)
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc.fontSize(10).text("Thankyou for shopping with us.", 50, 780, {
    align: "center",
    width: 500,
  });
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    // .fontSize(8)
    .text(item, 50, y, { width: 30, align: "right" })
    .text(description, 90, y, { width: 180 })
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(value) {
  const _value = new Intl.NumberFormat("en-US", {
    style: "decimal",
    // currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
  return _value;
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  createInvoice,
};
