const btn_plot = document.getElementById("btn_plot");
btn_plot.addEventListener("click", plot);

async function load_years(){
    console.log('cambio', station.value);
    var year = await get_year(station.value);
    for (y of year){
        var opt = document.createElement('option');
        opt.value = y;
        opt.innerHTML = y;
        sel_year.appendChild(opt);
    }
}

async function load_months(){
    console.log('cambio', sel_year.value);
    var months = await get_months(station.value, sel_year.value);
    console.log(months);
    for (m of months){
        var opt = document.createElement('option');
        opt.value = m;
        opt.innerHTML = m;
        sel_month.appendChild(opt);
    }
}

async function load_dates(){
    console.log('cambio', sel_month.value);
    var dates = await get_days(station.value, sel_month.value);
    console.log(dates);
    for (d of dates){
        var opt = document.createElement('option');
        opt.value = d;
        opt.innerHTML = d;
        sel_fecha.appendChild(opt);
    }
}

const station = document.getElementById("plantel");
station.addEventListener("change", load_years);

const sel_year = document.getElementById("year");
sel_year.addEventListener("change", load_months);

const sel_month = document.getElementById("mes");
sel_month.addEventListener("change", load_dates);

const sel_fecha = document.getElementById("Fecha");
//station.addEventListener("change", load_years);
