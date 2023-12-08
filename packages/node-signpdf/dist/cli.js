#!/usr/bin/env node
"use strict";

var _pdfkit = _interopRequireDefault(require("pdfkit"));
var _signpdf = require("./signpdf");
var _helpers = require("./helpers");
var _nodeFs = _interopRequireDefault(require("node:fs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const createPdf = params => new Promise(resolve => {
  const requestParams = {
    placeholder: {},
    text: 'node-signpdf',
    addSignaturePlaceholder: true,
    pages: 1,
    layout: 'portrait',
    ...params
  };
  const pdf = new _pdfkit.default({
    autoFirstPage: false,
    size: 'A4',
    layout: requestParams.layout,
    bufferPages: true,
    pdfVersion: '1.4'
  });
  pdf.info.CreationDate = '';
  if (requestParams.pages < 1) {
    requestParams.pages = 1;
  }

  // Add some content to the page(s)
  for (let i = 0; i < requestParams.pages; i += 1) {
    pdf.addPage().fillColor('#333').fontSize(25).moveDown().text(requestParams.text).save();
  }

  // Collect the ouput PDF
  // and, when done, resolve with it stored in a Buffer
  const pdfChunks = [];
  pdf.on('data', data => {
    pdfChunks.push(data);
  });
  pdf.on('end', () => {
    resolve(Buffer.concat(pdfChunks));
  });
  const certBuffer = _nodeFs.default.readFileSync(requestParams.certFilePath);
  if (requestParams.addSignaturePlaceholder) {
    // Externally (to PDFKit) add the signature placeholder.
    const refs = (0, _helpers.pdfkitAddPlaceholderForPKCS1)({
      pdf,
      pdfBuffer: Buffer.from([pdf]),
      reason: 'I am the author',
      cert: certBuffer,
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
const command = process.argv[2];
try {
  if (command === 'create') {
    const certFilePath = process.argv[3];
    const outputFilePath = process.argv[4];
    createPdf({
      placeholder: {
        signatureLength: 260
      },
      text: 'This is a document',
      certFilePath: certFilePath
    }).then(tempsPdf => {
      _nodeFs.default.writeFileSync(outputFilePath, tempsPdf);
    });
  } else if (command === 'sign') {
    const pdfPath = process.argv[3];
    const keyFilePath = process.argv[4];
    const outputPdf = process.argv[5];
    const passphrase = 'password';
    const pdfBuffer = _nodeFs.default.readFileSync(pdfPath);
    let signer = new _signpdf.SignPdf();
    let key = _nodeFs.default.readFileSync(keyFilePath);
    const signedPdf = signer.sign_pkcs1(pdfBuffer, key, {
      passphrase
    });
    _nodeFs.default.writeFileSync(outputPdf, signedPdf);
  }
} catch (e) {
  console.log(e);
}