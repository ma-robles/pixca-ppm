const btn_plot = document.getElementById("btn_plot");
btn_plot.addEventListener("click", plot);
const station = document.getElementById("plantel");
const sel_year = document.getElementById("year");
const sel_month = document.getElementById("mes");
const sel_fecha = document.getElementById("Fecha");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const downloadZipButton = document.getElementById("downloadZip");

let currentStep = 1;

function get_csv() {
  const sid = station.value;
  const date = sel_fecha.value;
  const url = `https://ruoa.unam.mx:8042/pm_api&sid=${sid}&date=${date}`;
  document.getElementById('csvURL').href = url;
}

function hideButtons() {
  const elementsToHide = [station, sel_year, sel_month, sel_fecha, btn_plot, 
                          document.getElementById("btn_download"), startDateInput, endDateInput, downloadZipButton];

  elementsToHide.forEach(element => element.style.display = "none");

  switch (currentStep) {
    case 1:
      station.style.display = "block";
      station.disabled = false;
      break;
    case 2:
      [station, sel_year].forEach(element => element.style.display = "block");
      station.disabled = true;
      sel_year.disabled = false;
      break;
    case 3:
      [station, sel_year, sel_month].forEach(element => element.style.display = "block");
      station.disabled = true;
      sel_year.disabled = true;
      sel_month.disabled = false;
      break;
    case 4:
      [station, sel_year, sel_month, sel_fecha].forEach(element => element.style.display = "block");
      station.disabled = true;
      sel_year.disabled = true;
      sel_month.disabled = true;
      sel_fecha.disabled = false;
      break;
    case 5:
      [station, sel_year, sel_month, sel_fecha, btn_plot, document.getElementById("btn_download"), 
       startDateInput, endDateInput, downloadZipButton].forEach(element => element.style.display = "block");
      [station, sel_year, sel_month, sel_fecha].forEach(element => element.disabled = true);
      get_csv();
      break;
  }
}

async function load_years() {
  const year = await get_year(station.value);
  year.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.innerHTML = y;
    sel_year.appendChild(opt);
  });
  currentStep = 2;
  hideButtons();
}

async function load_months() {
  const months = await get_months(station.value, sel_year.value);
  months.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.innerHTML = m;
    sel_month.appendChild(opt);
  });
  currentStep = 3;
  hideButtons();
}

async function load_dates() {
  const dates = await get_days(station.value, sel_month.value);
  dates.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.innerHTML = d;
    sel_fecha.appendChild(opt);
  });

  flatpickr(startDateInput, {
    enable: dates.map(date => new Date(date)),
    dateFormat: "Y-m-d"
  });

  flatpickr(endDateInput, {
    enable: dates.map(date => new Date(date)),
    dateFormat: "Y-m-d"
  });

  currentStep = 4;
  hideButtons();
}

station.addEventListener("change", load_years);
sel_year.addEventListener("change", load_months);
sel_month.addEventListener("change", load_dates);
sel_fecha.addEventListener("change", () => {
  currentStep = 5;
  hideButtons();
});

downloadZipButton.addEventListener("click", async () => {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  if (!startDate || !endDate) {
    alert("Por favor, selecciona las fechas de inicio y fin.");
    return;
  }

  try {
    const zipData = await fetchZipData(startDate, endDate);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipData);
    link.setAttribute('download', 'data.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    alert(`Error al descargar el archivo: ${error.message}`);
  }
});

async function fetchZipData(startDate, endDate) {
  const response = await fetch('/download_zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `startDate=${startDate}&endDate=${endDate}`
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.blob();
}

hideButtons();
