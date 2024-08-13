const stationSelect = document.getElementById("plantel");
const yearSelect = document.getElementById("year");
const monthSelect = document.getElementById("mes");
const dateInput = document.getElementById("fecha");
const calendarContainer = document.getElementById("calendar-container");
const monthYearDisplay = document.getElementById("month-year");
const daysContainer = document.getElementById("days");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const btnPlot = document.getElementById("btn_plot");
const downloadZipButton = document.getElementById("downloadZip");
const csvURL = document.getElementById("csvURL");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let availableDates = [];
let currentStep = 1;

// API Interaction
async function fetchFromAPI(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('API error:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

async function fetchAvailableDates(stationId, year, month) {
  const url = `https://ruoa.unam.mx:8042/pm_api?sid=${stationId}&year=${year}&month=${month}&action=get_days`;
  const data = await fetchFromAPI(url);
  return data ? data.dates : [];
}

async function getYears(stationId) {
  const url = `https://ruoa.unam.mx:8042/pm_api?sid=${stationId}&action=get_years`;
  const data = await fetchFromAPI(url);
  return data ? data.years : [];
}

async function getMonths(stationId, year) {
  const url = `https://ruoa.unam.mx:8042/pm_api?sid=${stationId}&year=${year}&action=get_months`;
  const data = await fetchFromAPI(url);
  return data ? data.months : [];
}

async function getDays(stationId, year, month) {
  const url = `https://ruoa.unam.mx:8042/pm_api?sid=${stationId}&year=${year}&month=${month}&action=get_days`;
  const data = await fetchFromAPI(url);
  return data ? data.days : [];
}

// Calendar rendering
function renderCalendar(month, year, availableDates) {
  daysContainer.innerHTML = "";
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
  const firstDay = new Date(year, month).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    daysContainer.appendChild(createDisabledCell());
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = createDayCell(day, month, year, availableDates.includes(day.toString()));
    daysContainer.appendChild(dayCell);
  }

  fillRemainingCells(firstDay + daysInMonth);
}

function createDisabledCell() {
  const cell = document.createElement("div");
  cell.classList.add("disabled");
  return cell;
}

function createDayCell(day, month, year, isAvailable) {
  const dayCell = document.createElement("div");
  dayCell.textContent = day;

  if (isAvailable) {
    dayCell.classList.add("available");
    dayCell.addEventListener("click", () => handleDateSelection(new Date(year, month, day)));
  } else {
    dayCell.classList.add("disabled");
  }

  return dayCell;
}

function fillRemainingCells(filledCells) {
  const remainingCells = 35 - filledCells;
  for (let i = 0; i < remainingCells; i++) {
    daysContainer.appendChild(createDisabledCell());
  }
}

function handleDateSelection(date) {
  dateInput.value = date.toISOString().slice(0, 10);
}

// Select element population
function populateSelect(selectElement, options) {
  selectElement.innerHTML = '<option disabled selected value>Selecciona</option>';
  options.forEach(optionValue => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    selectElement.appendChild(option);
  });
}


// CSV Generation
function get_csv() {
  const url = `https://ruoa.unam.mx:8042/pm_api?sid=${stationSelect.value}&date=${dateInput.value}`;
  csvURL.href = url;
}

// Plot generation (dummy function, to be implemented)
function generatePlot(station, year, month, date) {
  console.log('Plotting data for', station, year, month, date);
}

// Initial setup
const stationNames = ["pmpembu20230001", "pmpembu20230002", "pmpembu20230003", "pmpembu20230004", "pmpembu20230005", "pmpembu20230006", "pixca_ppm012", "pixca_ppm013", "pixca_ppm015", "pixca_ppm016"];
populateSelect(stationSelect, stationNames);

// Event listeners
stationSelect.addEventListener("change", async () => {
  const years = await getYears(stationSelect.value);
  populateSelect(yearSelect, years);
  currentStep = 2;
  hideButtons();
});

/*

yearSelect.addEventListener("change", async () => {
  const months = await getMonths(stationSelect.value, yearSelect.value);
  populateSelect(monthSelect, months); 
  currentStep = 3;
  hideButtons();
});

monthSelect.addEventListener("change", async () => {
  const selectedMonth = parseInt(monthSelect.value); // Get numerical month value
  const days = await getDays(stationSelect.value, yearSelect.value, selectedMonth);
  renderCalendar(selectedMonth - 1, parseInt(yearSelect.value), days); 
  currentStep = 4;
  hideButtons();
});

dateInput.addEventListener("change", () => {
  currentStep = 5;
  hideButtons();
});

*/

/*

btnPlot.addEventListener("click", () => {
  generatePlot(stationSelect.value, yearSelect.value, monthSelect.value, dateInput.value);
});

downloadZipButton.addEventListener("click", () => {
  const zipUrl = `https://ruoa.unam.mx:8042/pm_api?sid=${stationSelect.value}&year=${yearSelect.value}&month=${monthSelect.value}&date=${dateInput.value}&action=download_zip`;
  window.location.href = zipUrl;
});

*/
prevMonthButton.addEventListener("click", () => {
  if (--currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  // updateCalendar();
});

nextMonthButton.addEventListener("click", () => {
  if (++currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  // updateCalendar();
});

/*

function updateCalendar() {
  const selectedStation = stationSelect.value;
  const selectedYear = parseInt(yearSelect.value);
  const selectedMonth = parseInt(monthSelect.value);

  if (selectedStation && selectedYear && selectedMonth) {
    fetchAvailableDates(selectedStation, selectedYear, selectedMonth + 1)
      .then(dates => renderCalendar(selectedMonth, selectedYear, dates));
  }
  
}

*/

renderCalendar(currentMonth, currentYear, []);
