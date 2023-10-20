
var chartDom = document.getElementById('div_plot');
var myChart = echarts.init(chartDom);
window.addEventListener('resize', function() {
    myChart.resize();
});
var option;

async function get_var( sid, date){
  const url = 'https://ruoa.unam.mx:8041/pm_api&sid='+ sid + '&date='+ date;
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


    data = await get_var(sid, date);
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
          type: 'shadow'
        }
      },
    toolbox: {
        feature: {
            dataView: { readOnly: false},
            dataZoom: {
            yAxisIndex: 'none'
        },
            restore: {},
            saveAsImage: {}
        }
    },
      title:{
          text: date,
      },
    xAxis: {
      name: '[UTC]',
      type: 'time',
      //type: 'category',
    },
    yAxis: {
        name: '[ug/m3]',
        type: 'value'
    },
    series: [
      {
        name: 'PM 1.0',
        type: 'line',
          z: 5,
          symbol: 'none',
          //symbolSize: 5,
          areaStyle: {},
          //lineStyle:{width:1},
          encode:{ x:0,y:1}
      },
      {
        name: 'PM 2.5',
        type: 'line',
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
        type: 'line',
          symbol: 'none',
          //symbolSize: 5,
          areaStyle: {},
          lineStyle:{width:1},
          encode:{ x:0,y:3}
      },
      {
        name: 'PM 10',
          z: 2,
        type: 'line',
          symbol: 'none',
          //symbolSize: 5,
          areaStyle: {},
          lineStyle:{width:1},
          encode:{ x:0,y:3}
      },
    ]
  };
  option && myChart.setOption(option);
}

//plot('123');

