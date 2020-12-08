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

        console.log(JSONObject);
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
