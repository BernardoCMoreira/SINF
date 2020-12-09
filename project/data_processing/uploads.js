const axios = require("axios");
const e = require("express");

let satfFiles = new Map();
let currentFiscalYear;

const getEveryFiscalYear = () => {
  return Array.from(satfFiles.keys());
};

const getCurrentFiscalYear = () => {
  return currentFiscalYear;
};

const getSAFTFile = (fiscalYear) => {
  return satfFiles.get(fiscalYear);
};

const addNewSAFTFile = (fiscalYear, satfFile) => {
  satfFiles.set(fiscalYear, satfFile);
};

const setCurrentFiscalYear = (fiscalYear) => {
  currentFiscalYear = fiscalYear;
};

module.exports = {
  fiscalYears: getEveryFiscalYear,
  fiscalYear: getCurrentFiscalYear,
  SAFTFile: getSAFTFile,
  addSAFTFile: addNewSAFTFile,
  setFiscalYear: setCurrentFiscalYear,
};
