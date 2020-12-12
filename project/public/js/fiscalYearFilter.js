let fiscalYearOptions = document.querySelectorAll("#fiscalYearSelector");

[].forEach.call(fiscalYearOptions, function (btn) {
  btn.addEventListener("input", func);
});

function func() {
  let optionElement = event.target.options[event.target.selectedIndex];

  let newFiscalYear = optionElement.getAttribute("id").split("-")[1];

  window.location.href =
    window.location.pathname + "?fiscalYear=" + newFiscalYear;
}
