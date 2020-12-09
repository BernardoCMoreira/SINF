const axios = require("axios");
const e = require("express");

let saftAccountingFiles = new Map();
let saftBillingFiles = new Map();

const getEveryFiscalYear = () => {
  let keys1 = Array.from(saftAccountingFiles.keys());
  let keys2 = Array.from(saftBillingFiles.keys());

  return keys1.concat(keys2.filter((item) => keys1.indexOf(item) < 0));
};

const getSaftAccountingFiles = () => {
  return saftAccountingFiles;
};

const getSaftBillingFiles = () => {
  return saftBillingFiles;
};

const addNewSAFTFile = (fiscalYear, satfFile) => {
  if (satfFile.AuditFile.Header.FileType == "Accounting File") {
    saftAccountingFiles.set(fiscalYear, satfFile);
  } else if (satfFile.AuditFile.Header.FileType == "Billing File") {
    saftBillingFiles.set(fiscalYear, satfFile);
  }
};

const removeSAFTFile = (info) => {
  for (let i = 0; i < info.length; i++) {
    if (info[i].fileType == "Accounting") {
      saftAccountingFiles.delete(info[i].fiscalYear);
    } else if (info[i].fileType == "Billing") {
      saftBillingFiles.delete(info[i].fiscalYear);
    }
  }
};

module.exports = {
  fiscalYears: getEveryFiscalYear,
  SAFTAccoutingFiles: getSaftAccountingFiles,
  SAFTBillingFiles: getSaftBillingFiles,
  addNewSAFTFile: addNewSAFTFile,
  removeSAFTFile: removeSAFTFile,
};
