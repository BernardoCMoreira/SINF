let uploadButton = document.querySelectorAll("#SAFT-File");

[].forEach.call(uploadButton, function (btn) {
  btn.addEventListener("change", manageFile);
});

function manageFile() {
  let file = document.getElementById("SAFT-File").files[0];

  if (file) {
    let lastDot = file.name.lastIndexOf(".");
    let ext = file.name.substring(lastDot + 1);

    if (ext !== "xml") {
      return;
    } else {
      file.text().then((response) => {
        let parser = new DOMParser();
        let xml = parser.parseFromString(response, "text/xml");

        let JSONObject = xml2json(xml);

        let fileType = getFileType(JSONObject);
        if (fileType == "") {
          alert("Invalid File!");
          return;
        }
        JSONObject.AuditFile.Header["FileType"] = fileType;

        let fileFiscalYear = JSONObject.AuditFile.Header.FiscalYear;
        let fileVersion = JSONObject.AuditFile.Header.AuditFileVersion;

        let fiscalYearContainer = document.getElementById(
          "fiscalYearContainer-" + fileFiscalYear
        );

        if (fiscalYearContainer === null) {
          addNewFiscalYearContainer(fileFiscalYear);
        }

        displayFile(fileFiscalYear, fileType, fileVersion);

        fetch("api/uploadSAFT", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(JSONObject),
        })
          .then(function (response) {
            if (response.ok) {
              console.log("SAFT upload successful");
              alert("SAF-T file upload successful!");
              return;
            }
            throw new Error("Request failed.");
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    }
  }
}

function xml2json(xml) {
  try {
    var obj = {};
    if (xml.children.length > 0) {
      for (var i = 0; i < xml.children.length; i++) {
        var item = xml.children.item(i);
        var nodeName = item.nodeName;

        if (typeof obj[nodeName] == "undefined") {
          obj[nodeName] = xml2json(item);
        } else {
          if (typeof obj[nodeName].push == "undefined") {
            var old = obj[nodeName];

            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xml2json(item));
        }
      }
    } else {
      obj = xml.textContent;
    }
    return obj;
  } catch (e) {
    console.log(e.message);
  }
}

function getFileType(JSONObject) {
  let fileType = "";
  if (
    JSONObject.AuditFile.MasterFiles.hasOwnProperty("GeneralLedgerAccounts")
  ) {
    fileType = "Accounting File";
  } else {
    fileType = "Billing File";
  }

  return fileType;
}

function addNewFiscalYearContainer(fiscalYear) {
  let HTMLBlock = `<div class="container-fluid mb-3" id="fiscalYearContainer-${fiscalYear}">
    <h4 class="card-title">Fiscal Year: ${fiscalYear}</h4>
  </div>

  <!-- Divider -->
  <hr class="sidebar-divider d-none d-md-block">`;

  let saftListContainer = document.getElementById("SAFT-list");
  saftListContainer.insertAdjacentHTML("beforeend", HTMLBlock);
}

function displayFile(fiscalYear, fileType, fileVersion) {
  let type = fileType.split(" File");

  let fileElement = document.getElementById(
    "fiscalYear-" + fiscalYear + "-" + type[0]
  );

  if (fileElement !== null) {
    fileElement.remove();
  }

  let HTMLBlock = `<div id="fiscalYear-${fiscalYear}-${
    type[0]
  }" class="custom-control custom-checkbox mb-3 ml-3">
            <input type="checkbox" class="custom-control-input" id="checkBox-${fiscalYear}-${
    type[0]
  }">
            <label class="custom-control-label" for="checkBox-${fiscalYear}-${
    type[0]
  }">${fileType + " " + "v" + fileVersion}</label>
        </div>`;

  let saftListContainer = document.getElementById(
    "fiscalYearContainer-" + fiscalYear
  );
  saftListContainer.insertAdjacentHTML("beforeend", HTMLBlock);

  document.getElementById("SAFT-File").value = "";
}
