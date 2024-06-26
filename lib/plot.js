
var chartDom = document.getElementById('div_plot');
var myChart = echarts.init(chartDom);
window.addEventListener('resize', function() {
    myChart.resize();
});
var option;


async function get_year(sid) {
    const url = 'https://ruoa.unam.mx:8042/pm_api&sid='+ sid;
    response = await fetch(url);
    if (response.ok) {
        body = await response.text();
        lines = body.split('\n')[0].split(',');
        return (lines);
    }
    else {
        return ([]);
    }
}

async function get_months(sid, year) {
    const url = 'https://ruoa.unam.mx:8042/pm_api&sid='+ sid+ '&year='+year;
    response = await fetch(url);
    if (response.ok) {
        body = await response.text();
        lines = body.split('\n')[0].split(',');
        return (lines);
    }
    else {
        return ([]);
    }
}

async function get_days(sid, month) {
    const url = 'https://ruoa.unam.mx:8042/pm_api&sid='+ sid+  '&month=' + month;
    response = await fetch(url);
    if (response.ok) {
        body = await response.text();
        lines = body.split('\n')[0].split(',');
        return (lines);
    }
    else {
        return ([]);
    }
}

async function get_var( sid, date){
  const url = 'https://ruoa.unam.mx:8042/pm_api&sid='+ sid + '&date='+ date;
  response = await fetch(url);
  if (response.ok) {
      body= await response.text();
      lines = body.split('\n');
      data = [];
      //rows
      i=0;
      for (const l of lines){
      
          dline =[];
          datacsv = l.split(',');
          if (l.length == 0) continue;
          //cols
          j=0;
          for (const d of datacsv){
              //omite salto de línea
              if (j== datacsv.length-1 && i!=0) break;

              if (j==0){
                  j=1;
                  continue;
              }
              if (i>0 && j>1){
                  dline.push(parseFloat(d));
              }else if(i==0){
                  //headers
                  dline.push(d);
              }
              else{
                  dline.push(Date.parse(d.slice(0,19)));
              }
              j+=1;
          }
          data.push(dline)
          i +=1;
      }



  }else {
    data =[];
    console.log('ups');
  }
  return data;
}
async function plot(){
    const sta = document.getElementById("plantel");
    sid=sta.value;

    const dte = document.getElementById("Fecha");
    date = dte.value;
    console.log( sid, date);
    const offset_name = 25;
    const offset_ax =60;
    //const colors = ['#5470C6', '#91CC75', '#EE6666'];
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];


    years = await get_year(sid);
    console.log('years:', years);
    months = await get_months(sid, years[0]);
    console.log('months:', months);
    days = await get_days(sid, months[0]);
    console.log('days:', days);

    data = await get_var(sid, date);
    if (data.length == 0){
        alert('Datos no encontrados!');
        return 0;
    }
    //console.log(data);
    //data debe ser un arreglo con los datos del archivo
    dataset= {
        source:data,
    }
    //
    //ejemplo de estructura
    //dataset= {
        //source:[
            //['fecha',
                //'PM1.0',
                //'PM2.5',
                //'PM10',
            //],
            //["2023-10-11T23:13:17-06",0,0,0],
            //["2023-10-11T23:14:17-06",1,1,10],
            //["2023-10-11T23:15:17-06",0,2,10],
            //["2023-10-11T23:16:17-06",2,4,9],
            //["2023-10-11T23:17:17-06",5,4,15],
        //]
    //}
  option = {
      dataset: dataset,
      legend:{},
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
    toolbox: {
        feature: {
            dataView: { readOnly: false},
            dataZoom: {
            //yAxisIndex: 'none'
        },
            restore: {},
            saveAsImage: {}
        }
    },
      title:{
          text: date,
      },
    xAxis: {
      name: '[UTC0]',
      nameGap: offset_name,
      type: 'time',
      nameLocation: 'center',
      //type: 'category',
    },
    yAxis: [{
        name: '[ug/m3]',
      nameGap: offset_name,
        type: 'value',
        nameLocation: 'center',
        min: 0,
        max: 150,
    },
    {
        name: '[C]',
      nameGap: offset_name,
        axisLine:{
            show: true,
            lineStyle:{
                color: colors[4]
            }
        },
        type: 'value',
        nameLocation: 'center',
        min: -10,
        max: 40,
    },
    {
        name: '[%]',
      nameGap: offset_name,
        axisLine:{
            show: true,
            lineStyle:{
                color: colors[5]
            }
        },
        type: 'value',
        nameLocation: 'center',
        min: 0,
        max: 100,
        offset: offset_ax,
    },
    {
        name: '[mbar]',
      nameGap: offset_name,
        axisLine:{
            show: true,
            lineStyle:{
                color: colors[6],
                onZero: false,
            }
        },
        type: 'value',
        nameLocation: 'center',
        min: 750,
        position: 'left',
        alignTicks: true,
        offset: offset_ax,
    },
    ],
    series: [
      {
        name: 'PM 1.0',
        yAxisIndex:0,
        type: 'bar',
          z: 5,
          symbol: 'none',
          //symbolSize: 5,
          areaStyle: {},
          //lineStyle:{width:1},
          encode:{ x:0,y:1}
      },
      {
        name: 'PM 2.5',
        type: 'bar',
          z: 4,
          symbol: 'none',
          //symbolSize: 5,
          areaStyle: {},
          lineStyle:{width:1},
          encode:{ x:0,y:2}
      },
      {
        name: 'PM 4',
          z: 3,
        type: 'bar',
          symbol: 'none',
          //symbolSize: 5,
          areaStyle: {},
          lineStyle:{width:1},
          encode:{ x:0,y:3}
      },
      {
        name: 'PM 10',
          z: 2,
        type: 'bar',
          symbol: 'none',
          //symbolSize: 5,
          areaStyle: {},
          lineStyle:{width:1},
          encode:{ x:0,y:4}
      },
      {
        name: 'Temperatura',
        yAxisIndex:1,
          z: 2,
        type: 'scatter',
          //symbol: 'none',
          symbolSize: 2,
          //lineStyle:{width:1},
          encode:{ x:0,y:5}
      },
      {
        name: 'Humedad Relativa',
        yAxisIndex:2,
          z: 2,
        type: 'scatter',
          //symbol: 'none',
          symbolSize: 2,
          //lineStyle:{width:1},
          encode:{ x:0,y:6}
      },
      {
        name: 'Presión',
        yAxisIndex:3,
          z: 2,
        type: 'scatter',
          //symbol: 'none',
          symbolSize: 2,
          //lineStyle:{width:1},
          encode:{ x:0,y:7}
      },
    ]
  };
  option && myChart.setOption(option);
}

//plot('123');

