
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
          //cols
          j=0;
          for (const d of datacsv){
              if (j==0){
                  j=1;
                  continue;
              }
              parse_data = parseFloat(d);
              if (i>0 && j>1){
                  dline.push(parse_data);
              }else{
                  if (i>0){
                      dline.push(d.split('T')[1]);
                  }else{
                      dline.push(d);
                  }
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
async function plot( sid, date){
    data = await get_var(sid, date);
    //data debe ser un arreglo con los datos del archivo
    dataset= {
        source:data,
    }

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
            dataView: { readOnly: true },
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
        name: 'UTC',
      type: 'category',
      //data: date,
    },
    yAxis: {
        name: '[ug/m3]',
        gridIndex: 0,
      //type: 'value'
    },
    series: [
      {
        //name: '',
        type: 'line',
      },
      {
        //name: '',
        type: 'line',
      },
      {
        //name: '',
        type: 'line',
      },
    ]
  };
  option && myChart.setOption(option);
}

//plot('123');

