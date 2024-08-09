const calendarContainer = document.getElementById("calendar-container");
const monthYearDisplay = document.getElementById("month-year");
const daysContainer = document.getElementById("days");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const yearSelect = document.getElementById("year");
const monthSelect = document.getElementById("mes");
const stationSelect = document.getElementById("plantel");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const downloadZipButton = document.getElementById("downloadZip");
const btnPlot = document.getElementById("btn_plot");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDates = [];
let selectedStartDate = null;
let selectedEndDate = null;
let currentStep = 1;

//Calendario

function updateCalendar() {
    const selectedStation = stationSelect.value;
    if (selectedStation) {
        loadYearsForStation(selectedStation); // Fetch and display years
    } 
}

async function fetchYears(stationId) {
    const response = await fetch(`https://ruoa.unam.mx:8042/pm_api?sid=${stationId}&action=get_years`);
    if (!response.ok) {
        throw new Error("Error al obtener los años");
    }
    const years = (await response.text()).split(",");
    return years;
}

async function fetchMonths(stationId, year) {
    const response = await fetch(`https://ruoa.unam.mx:8042/pm_api?sid=${stationId}&action=get_months&year=${year}`);
    if (!response.ok) {
        throw new Error("Error al obtener los meses");
    }
    const months = (await response.text()).split(",");
    return months;
}

async function fetchDays(stationId, year, month) {
    const response = await fetch(`https://ruoa.unam.mx:8042/pm_api?sid=${stationId}&action=get_days&year=${year}&month=${month}`);
    if (!response.ok) {
        throw new Error("Error al obtener los días");
    }
    const days = (await response.text()).split(",");
    return days;
}

async function loadDatesForStation(stationId, year, month) {
    const dates = await fetchDays(stationId, year, month);
    renderCalendar(month, year, dates);
}

async function loadYearsForStation(stationId) {
    const years = await fetchYears(stationId);
    yearSelect.innerHTML = ""; // Clear previous years
    years.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.text = year;
        yearSelect.add(option);
    });

    const defaultYear = years[0]; 
    loadMonthsForStation(stationId, defaultYear);
}

async function loadMonthsForStation(stationId, year) {
    const months = await fetchMonths(stationId, year);
    monthSelect.innerHTML = ''; 
    months.forEach(month => {
        const option = document.createElement("option");
        option.value = month;
        option.text = month;
        monthSelect.add(option);
    });

    const defaultMonth = months[0]; 
    loadDatesForStation(stationId, year, defaultMonth);
}

function renderCalendar(month, year, availableDates) {
    daysContainer.innerHTML = "";
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("disabled");
        daysContainer.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.textContent = day;

        dayCell.classList.add("available");
        dayCell.addEventListener("click", function() {
            handleDateSelection(new Date(year, month, day));
        });

        daysContainer.appendChild(dayCell);
    }

    const remainingCells = 42 - daysInMonth - firstDay;
    for (let i = 0; i < remainingCells; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("disabled");
        daysContainer.appendChild(emptyCell);
    }
}

function handleDateSelection(date) {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        selectedStartDate = date;
        selectedEndDate = null;
    } else if (selectedStartDate && !selectedEndDate) {
        selectedEndDate = date;
    }
    updateSelectedDates();
}

function updateSelectedDates() {
    const dayCells = daysContainer.querySelectorAll("div");
    dayCells.forEach(cell => {
        cell.classList.remove("selected", "start-date", "end-date");
    });

    if (selectedStartDate) {
        const startCell = [...dayCells].find(cell => parseInt(cell.textContent) === selectedStartDate.getDate());
        if (startCell) {
            startCell.classList.add("selected", "start-date");
        }
    }

    if (selectedEndDate) {
        const endCell = [...dayCells].find(cell => parseInt(cell.textContent) === selectedEndDate.getDate());
        if (endCell) {
            endCell.classList.add("selected", "end-date");
        }
    }
}

stationSelect.addEventListener("change", updateCalendar);

prevMonthButton.addEventListener("click", function() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    const selectedStation = stationSelect.value;
    if (selectedStation) {
        loadDatesForStation(selectedStation, currentYear, currentMonth);
    }
});

nextMonthButton.addEventListener("click", function() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    const selectedStation = stationSelect.value;
    if (selectedStation) {
        loadDatesForStation(selectedStation, currentYear, currentMonth);
    }
});


// Función asíncrona para obtener datos en formato ZIP
async function fetchZipData(startDate, endDate) {
    const stationId = stationSelect.value;
    // Realiza una petición fetch a la API para obtener los datos en formato ZIP
    const response = await fetch(`https://ruoa.unam.mx:8042/pm_api?sid=${stationId}&action=download_zip`, {
        method: 'POST',
        body: `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sid=${stationId}`
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Devuelve los datos como un Blob
    return await response.blob();
}

downloadZipButton.addEventListener("click", async () => {
    const startDate = selectedStartDate;
    const endDate = selectedEndDate;
    if (startDate && endDate) {
        try {
            const blob = await fetchZipData(startDate, endDate);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'data.zip');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error fetching ZIP data:', error);
        }
    } else {
        alert("Selecciona un rango de fechas para descargar.");
    }
});

renderCalendar(currentMonth, currentYear, []);
