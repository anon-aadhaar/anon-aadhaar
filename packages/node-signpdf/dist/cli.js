#!/usr/bin/env node
"use strict";

var _pdfkit = _interopRequireDefault(require("pdfkit"));
var _signpdf = require("./signpdf");
var _nodeFs = _interopRequireDefault(require("node:fs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const createPdf = params => new Promise(resolve => {
  const requestParams = {
    placeholder: {},
    text: "node-signpdf",
    addSignaturePlaceholder: true,
    pages: 1,
    layout: "portrait",
    ...params
  };
  const pdf = new _pdfkit.default({
    autoFirstPage: false,
    size: "A4",
    layout: requestParams.layout,
    bufferPages: true
  });
  pdf.info.CreationDate = "";
  if (requestParams.pages < 1) {
    requestParams.pages = 1;
  }

  // Add some content to the page(s)
  for (let i = 0; i < requestParams.pages; i += 1) {
    pdf.addPage().fillColor("#333").fontSize(25).moveDown().text(requestParams.text).save();
  }

  // Collect the ouput PDF
  // and, when done, resolve with it stored in a Buffer
  const pdfChunks = [];
  pdf.on("data", data => {
    pdfChunks.push(data);
  });
  pdf.on("end", () => {
    resolve(Buffer.concat(pdfChunks));
  });
  if (requestParams.addSignaturePlaceholder) {
    console.log({
      ...requestParams.placeholder
    });
    // Externally (to PDFKit) add the signature placeholder.
    const refs = (0, _signpdf.pdfkitAddPlaceholder)({
      pdf,
      pdfBuffer: Buffer.from([pdf]),
      reason: "I am the author",
      ...requestParams.placeholder
    });

    // console.log(refs);
    // Externally end the streams of the created objects.
    // PDFKit doesn't know much about them, so it won't .end() them.
    Object.keys(refs).forEach(key => refs[key].end());
  }

  // Also end the PDFDocument stream.
  // See pdf.on('end'... on how it is then converted to Buffer.
  pdf.end();
});
function signPDF({
  pdfPath,
  keyFilePath,
  passphrase = "password"
}) {
  createPdf({
    placeholder: {
      signatureLength: 260
    },
    text: "This is a document"
  }).then(pdfBuffer => {
    console.log(pdfBuffer);
    let signer = new _signpdf.SignPdf();
    let key = _nodeFs.default.readFileSync(keyFilePath);
    const signedPdf = signer.sign_pkcs1(pdfBuffer, key, {
      passphrase
    });
    _nodeFs.default.writeFileSync(pdfPath, signedPdf);
  });
}
try {
  const pdfPath = process.argv[2];
  const keyFilePath = process.argv[3];
  const passphrase = process.argv[4] || undefined;
  console.log(passphrase);
  signPDF({
    pdfPath,
    keyFilePath,
    passphrase
  });
} catch (e) {
  console.log(e);
}