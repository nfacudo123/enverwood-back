const { obtenerResumenFinanciero } = require('../models/reportes.model');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

const verResumenGeneral = async (req, res) => {
  const resumen = await obtenerResumenFinanciero();
  res.json(resumen);
};

const exportarResumenCSV = async (req, res) => {
  const resumen = await obtenerResumenFinanciero();
  const parser = new Parser();
  const csv = parser.parse([resumen]);

  res.header('Content-Type', 'text/csv');
  res.attachment('resumen_sistema.csv');
  res.send(csv);
};

const exportarResumenExcel = async (req, res) => {
  const resumen = await obtenerResumenFinanciero();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Resumen');

  sheet.columns = Object.keys(resumen).map(key => ({ header: key, key }));
  sheet.addRow(resumen);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=resumen_sistema.xlsx');
  await workbook.xlsx.write(res);
};

const exportarResumenPDF = async (req, res) => {
  const resumen = await obtenerResumenFinanciero();
  const doc = new PDFDocument();

  res.setHeader('Content-Disposition', 'attachment; filename=resumen_sistema.pdf');
  res.setHeader('Content-Type', 'application/pdf');

  doc.pipe(res);
  doc.fontSize(20).text('Resumen Financiero del Sistema', { align: 'center' }).moveDown();

  Object.entries(resumen).forEach(([key, value]) => {
    doc.fontSize(12).text(`${key}: ${value}`);
  });

  doc.end();
};

module.exports = {
  verResumenGeneral,
  exportarResumenCSV,
  exportarResumenExcel,
  exportarResumenPDF
};
