const btn_plot = document.getElementById("btn_plot");
const station = document.getElementById("plantel");
const sel_year = document.getElementById("year");
const sel_month = document.getElementById("mes");
const sel_fecha = document.getElementById("Fecha");
const dateInputStart = document.getElementById("fecha_inicio"); 
const dateInputEnd = document.getElementById("fecha_fin");  
const calendarContainer = document.getElementById("calendar-container");
const monthYearDisplay = document.getElementById("month-year");
const daysContainer = document.getElementById("days");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const btnDownloadRange = document.getElementById("btn_download_range"); 

let availableDates = []; 
let selectedStartDate = null; 
let selectedEndDate = null; 
let currentMonth = new Date().getMonth(); 
let currentYear = new Date().getFullYear(); 
let currentStep = 1; 

function get_csv() {
    const sta = document.getElementById("plantel"); 
    const sid = sta.value; 
    const dte = document.getElementById("Fecha"); 
    const date = dte.value;
    console.log(sid, date);

    const url = 'https://ruoa.unam.mx:8042/pm_api&sid=' + sid + '&date=' + date;
    var a = document.getElementById('csvURL');
    a.href = url;
}

async function load_years() {
  console.log('cambio', station.value);
  var year = await get_year(station.value);
  for (y of year) {
    var opt = document.createElement('option');
    opt.value = y;
    opt.innerHTML = y;
    sel_year.appendChild(opt);
  }
  currentStep = 2;
}

async function load_months() {
  console.log('cambio', sel_year.value);
  var months = await get_months(station.value, sel_year.value);
  console.log(months);
  for (m of months) {
    var opt = document.createElement('option');
    opt.value = m;
    opt.innerHTML = m;
    sel_month.appendChild(opt);
  }
  currentStep = 3;
}

async function load_dates() {
  console.log('cambio', sel_month.value);
  var dates = await get_days(station.value, sel_month.value);
  console.log(dates);
  for (d of dates) {
    var opt = document.createElement('option');
    opt.value = d;
    opt.innerHTML = d;
    sel_fecha.appendChild(opt);
  }
  currentStep = 4;
}

station.addEventListener("change", load_years);
sel_year.addEventListener("change", load_months);
sel_month.addEventListener("change", load_dates);
sel_fecha.addEventListener("change", () => {
  currentStep = 5;
});

function renderCalendar(month, year) {
    daysContainer.innerHTML = ""; 
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`; 

    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 

    for (let i = 0; i < firstDay; i++) {
        daysContainer.appendChild(createDisabledCell());
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = createDayCell(day, month, year, true); 
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
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        selectedStartDate = date;
        selectedEndDate = null;
        dateInputStart.value = date.toISOString().slice(0, 10);
        dateInputEnd.value = '';
    } else if (date > selectedStartDate) {
        selectedEndDate = date;
        dateInputEnd.value = date.toISOString().slice(0, 10);
    } else {
        selectedStartDate = date;
        selectedEndDate = null;
        dateInputStart.value = date.toISOString().slice(0, 10);
        dateInputEnd.value = '';
    }
}

prevMonthButton.addEventListener("click", () => {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextMonthButton.addEventListener("click", () => {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    renderCalendar(currentMonth, currentYear);
});
/*
sel_month.addEventListener("change", () => {
    currentMonth = parseInt(sel_month.value);
    renderCalendar(currentMonth, currentYear); 
});
*/
sel_year.addEventListener("change", () => {
    currentYear = parseInt(sel_year.value);
    renderCalendar(currentMonth, currentYear);
});

function populateSelect(selectElement, options) {
    selectElement.innerHTML = '<option disabled selected value>Selecciona</option>';
    if (options && options.length > 0) {
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            selectElement.appendChild(option);
        });
    }
}

function downloadDateRange() {
    if (selectedStartDate && selectedEndDate) {
        const start = selectedStartDate.toISOString().slice(0, 10);
        const end = selectedEndDate.toISOString().slice(0, 10);
        const url = `https://ruoa.unam.mx:8042/pm_api?sid=${station.value}&start=${start}&end=${end}&action=download_range`;
        window.location.href = url;
    } else {
        alert('Por favor, selecciona un rango válido de fechas.');
    }
}

function downloadMonthData() {
    const selectedMonth = parseInt(sel_month.value); // This was already correct
    const selectedYear = parseInt(sel_year.value);
    // No need to calculate first day of month again, just use selectedMonth
    const url = `https://ruoa.unam.mx:8042/pm_api?sid=${station.value}&month=${selectedMonth}&year=${selectedYear}&action=download_month`; 
    window.location.href = url;
}

renderCalendar(currentMonth, currentYear);
