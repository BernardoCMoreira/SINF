let removeButton = document.querySelectorAll("#removeFilesButton");

[].forEach.call(removeButton, function (btn) {
  btn.addEventListener("click", removeFiles);
});

function removeFiles() {
  var selectedCheckboxes = document.querySelectorAll(
    "input[type=checkbox]:checked"
  );

  if (selectedCheckboxes.length == 0) {
    return;
  }

  let JSONArray = [];

  for (let i = 0; i < selectedCheckboxes.length; i++) {
    let elementId = selectedCheckboxes[i].parentElement.getAttribute("id");

    let fiscalYear = elementId.split("-")[1];
    let fileType = elementId.split("-")[2];

    let JSONObject = {};

    JSONObject["fiscalYear"] = fiscalYear;
    JSONObject["fileType"] = fileType;

    JSONArray.push(JSONObject);
  }

  fetch("api/removeSAFT", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSONArray),
  })
    .then(function (response) {
      if (response.ok) {
        for (let i = 0; i < selectedCheckboxes.length; i++) {
          selectedCheckboxes[i].parentElement.remove();
        }

        return;
      }
      throw new Error("Request failed.");
    })
    .catch(function (error) {
      console.log(error);
    });
}
