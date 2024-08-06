document.addEventListener("DOMContentLoaded", function() {
    const calendarContainer = document.getElementById("calendar-container");
    const monthYearDisplay = document.getElementById("month-year");
    const daysContainer = document.getElementById("days");
    const prevMonthButton = document.getElementById("prev-month");
    const nextMonthButton = document.getElementById("next-month");
    const yearSelect = document.getElementById("year-select");
    const monthSelect = document.getElementById("month-select");
    const stationSelect = document.getElementById("station");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const downloadZipButton = document.getElementById("download-zip");
    const btnPlot = document.getElementById("btn-plot");

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDates = [];
    let selectedStartDate = null;
    let selectedEndDate = null;
    let currentStep = 1;

// CALENDARIO

    function renderCalendar(month, year, availableDates) {
        daysContainer.innerHTML = "";
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.classList.add("disabled");
            daysContainer.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayCell = document.createElement("div");
            dayCell.textContent = day;

            if (availableDates.some(d => d.getTime() === date.getTime())) {
                dayCell.addEventListener("click", function() {
                    handleDateSelection(date);
                });
            } else {
                dayCell.classList.add("disabled");
            }

            daysContainer.appendChild(dayCell);
        }
    }

// pARA SELECCIONAR FECHAS

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
        dayCells.forEach(cell => cell.classList.remove("selected"));

        if (selectedStartDate) {
            const startCell = [...dayCells].find(cell => cell.textContent == selectedStartDate.getDate());
            if (startCell) startCell.classList.add("selected");
        }

        if (selectedEndDate) {
            const endCell = [...dayCells].find(cell => cell.textContent == selectedEndDate.getDate());
            if (endCell) endCell.classList.add("selected");
        }
    }

    function updateCalendar() {
        const selectedStation = stationSelect.value;
        if (selectedStation) {
            loadDatesForStation(selectedStation, currentYear, currentMonth);
        } else {
            daysContainer.innerHTML = "<div class='disabled'>No hay datos disponibles</div>";
        }
    }
// FECHAS DISPONIBLES SEGUN LA ESTACIÓN, AÑO, MES...
    async function loadYears() {
        const years = await fetchYears(stationSelect.value);
        yearSelect.innerHTML = "";
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        });
        currentStep = 2;
        hideButtons();
    }

    async function loadMonths() {
        const months = await fetchMonths(stationSelect.value, yearSelect.value);
        monthSelect.innerHTML = "";
        months.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            monthSelect.appendChild(opt);
        });
        currentStep = 3;
        hideButtons();
    }

    async function loadDatesForStation(stationId, year, month) {
        const dates = await fetchDays(stationId, year, month);
        selectedDates = dates.map(dateStr => new Date(dateStr));
        renderCalendar(currentMonth, currentYear, selectedDates);

// PARA SELECCIONAR FECHA DE INICIO Y FINAL
        flatpickr(startDateInput, {
            enable: selectedDates,
            dateFormat: "Y-m-d"
        });

        flatpickr(endDateInput, {
            enable: selectedDates,
            dateFormat: "Y-m-d"
        });

        currentStep = 4;
        hideButtons();
    }
// PARA OBTENER DATOS
    async function fetchYears(stationId) {
        const response = await fetch(`/get_years?station=${stationId}`);
        if (!response.ok) {
            throw new Error("Error al obtener los años");
        }
        return response.json();
    }

    async function fetchMonths(stationId, year) {
        const response = await fetch(`/get_months?station=${stationId}&year=${year}`);
        if (!response.ok) {
            throw new Error("Error al obtener los meses");
        }
        return response.json();
    }

    async function fetchDays(stationId, year, month) {
        const response = await fetch(`/get_days?station=${stationId}&year=${year}&month=${month}`);
        if (!response.ok) {
            throw new Error("Error al obtener los días");
        }
        return response.json();
    }
// ZIP
    async function fetchZipData(startDate, endDate) {
        const response = await fetch('/download_zip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `startDate=${startDate}&endDate=${endDate}&sid=${stationSelect.value}`
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.blob();
    }
/*
    function hideButtons() {
        btnPlot.style.display = (currentStep === 1 || currentStep === 3) ? "none" : "block";
        downloadZipButton.style.display = (currentStep === 3 || currentStep === 4) ? "block" : "none";
    }
*/
    prevMonthButton.addEventListener("click", function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar();
    });

    nextMonthButton.addEventListener("click", function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    });
    /*
        yearSelect.addEventListener("change", function() {
            currentYear = parseInt(yearSelect.value);
            updateCalendar();
        });
    
        monthSelect.addEventListener("change", function() {
            currentMonth = parseInt(monthSelect.value);
            updateCalendar();
        });
    
        stationSelect.addEventListener("change", () => {
            loadYears().then(() => {
                loadMonths().then(() => {
                    updateCalendar();
                });
            });
        });
        // ZIP 2
    
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
        */

    renderCalendar(currentMonth, currentYear, selectedDates);

    const startYear = 2000;
    const endYear = 2050;
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    yearSelect.value = currentYear;
    monthSelect.value = currentMonth;

    hideButtons();
});
