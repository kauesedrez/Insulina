let average = new Array(24).fill(0);

let database = [
  {
    type: "nph",
    time: 10,
    ui: 30,
    color: "#ff0000",
  },
];

let datasets = [];
let myChart;

const addValuesToAverage = (arr) => {
  average = average.map((valor, indice) => valor + arr[indice]);
};

const updateAverage = () => {
  average = new Array(24).fill(0);
  database.forEach((item, index) => {
    addValuesToAverage(
      item.type === "nph" ? nph(item.ui, item.time) : lispro(item.ui, item.time)
    );
  });
  myChart.data.datasets[myChart.data.datasets.length - 1].data = average;
  myChart.update();
};

const printGraph = (datasets) => {
  // @ts-ignore
  let ctx = document.getElementById("canvas").getContext("2d");

  if (myChart) {
    myChart.destroy(); // Destroi o gráfico e libera os recursos
  }

  // @ts-ignore
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23,
      ],
      datasets,
    },
    options: {
      tooltips: {
        position: "nearest",
        mode: "index",
        intersect: false,
      },
      scales: {
        yAxes: [
          {
            // Configuração para o eixo Y na versão 2.x
            ticks: {
              beginAtZero: true, // Inicia o eixo Y no zero
              min: 0, // Valor mínimo do eixo Y
              max: 60, // Valor máximo do eixo Y
            },
          },
        ],
      },
    },
  });
};

function changeTime(index, ev, display) {
  console.log({ display });
  let value = parseInt(ev.target.value);
  let item = database[index];

  myChart.data.datasets[index].data =
    item.type === "nph" ? nph(item.ui, value) : lispro(item.ui, value);
  myChart.data.datasets[index].label = `${item.type} ${value}h ${item.ui}ui`;
  database[index].time = value;
  // @ts-ignore
  document.getElementById(display).innerHTML = value;
  myChart.update();
  updateAverage();
}

function changeUi(index, ev, display) {
  let value = parseInt(ev.target.value);
  let item = database[index];

  myChart.data.datasets[index].data =
    item.type === "nph" ? nph(value, item.time) : lispro(value, item.time);
  myChart.data.datasets[index].label = `${item.type} ${item.time}h ${value}ui`;
  database[index].ui = value;
  // @ts-ignore
  document.getElementById(display).innerHTML = value;
  myChart.update();
  updateAverage();
}

function changeColor(index, ev) {
  let value = ev.target.value;
  let item = database[index];

  myChart.data.datasets[index].borderColor = value;
  database[index].color = value;
  myChart.update();
}

const printControls = () => {
  const component = (data) => `

    <div class='box'>

        <h2>${data.type}</h2>

        <div>
        
        <span>Horário da aplicação: <i id='h_${data.compId}'>${data.h_value}</i> hrs</span>
        <input 
        type='range' 
        min=0 
        max=24 
        value=${data.time} 
        onchange="changeTime(${data.index},event,'h_${data.compId}')"/>

        </div>

        <div>
        <span>Quantidade: <i id='ui_${data.compId}'>${data.ui_value}</i> ui</span>
        <input
         type='range' 
         min=0 
         max=60 
         value=${data.ui}
         onchange="changeUi(${data.index},event,'ui_${data.compId}')" />

         </div>

         <div>

         <span>Color</span>
         <input
         type='color'
         value='${data.color}' 
         onchange="changeColor(${data.index},event)"
         />

         </div>

    </div>

    `;

  let res = "";

  datasets = [];
  average = new Array(24).fill(0);
  database.forEach((item, index) => {
    datasets.push({
      label: `${item.type} ${item.time}h ${item.ui}ui`,
      data:
        item.type === "nph"
          ? nph(item.ui, item.time)
          : lispro(item.ui, item.time),
      fill: false,
      borderColor: item.color,
    });
    res += component({
      index,
      type: item.type,
      time: item.time,
      ui: item.ui,
      color: item.color,
      compId: Math.floor(Math.random() * 100) + 1,
      h_value: item.time,
      ui_value: item.ui,
    });
    addValuesToAverage(
      item.type === "nph" ? nph(item.ui, item.time) : lispro(item.ui, item.time)
    );
  });
  // @ts-ignore
  document.getElementById("controls").innerHTML = res;

  datasets.push({
    label: `Average`,
    data: average,
    fill: false,
    borderColor: "rgb(19, 226, 233)",
    borderDashOffset: 3,
    borderDash: [5, 13],
  });

  printGraph(datasets);
};

const nph = (ui, time) => {
  console.log("nph", { ui, time });
  let units = ui / 8;

  let data = [];
  let count = 0;
  for (let i = 0; i < 8; i++) {
    data.push(count);
    count += units;
  }
  for (let i = 0; i <= 8; i++) {
    data.push(count);
    count -= units;
  }

  let xAxis = [];

  if (time <= 8) {
    for (let x = 0; x <= 24; x++) {
      if (time < x) {
        xAxis.push(0);
      } else if (time === x) {
        xAxis.push(...data);
        x += 16;
      } else {
        xAxis.push(0);
      }
    }
  }

  if (time > 8) {
    let divisor = 24 - time;
    let initial_positions = time + 16 - 24;
    let vacum = time - initial_positions;
    let end = data.slice(0, divisor);
    let start = data.slice(divisor, 16);

    xAxis.push(...start);
    xAxis.push(...Array(vacum).fill(0));
    xAxis.push(...end);
  }

  return xAxis;
};

const lispro = (ui, time) => {
  const action = 4;
  const high_action = action / 2;
  const units = (ui / high_action) * 3;

  let data = [];
  let count = 0;
  for (let i = 0; i < high_action; i++) {
    data.push(count);
    count += units;
  }
  for (let i = 0; i <= high_action; i++) {
    data.push(count);
    count -= units;
  }

  let xAxis = [];

  if (time <= 18) {
    for (let x = 0; x <= 24; x++) {
      if (time < x) {
        xAxis.push(0);
      } else if (time === x) {
        xAxis.push(...data);
        x += action;
      } else {
        xAxis.push(0);
      }
    }
  }

  let divisor, initial_positions, vacum, end, start;
  if (time > 18) {
    divisor = 24 - time;
    initial_positions = time + action - 24;
    vacum = time - (initial_positions < 0 ? 0 : initial_positions);
    end = data.slice(0, divisor);
    start = data.slice(divisor, action);

    xAxis.push(...start);
    xAxis.push(...Array(vacum).fill(0));
    xAxis.push(...end);
  }

  return xAxis;
};

function addNph() {
  database.push({
    type: "nph",
    time: 10,
    ui: 30,
    color: "#cccccc",
  });

  printControls();
}

function addLispro() {
  database.push({
    type: "lispro",
    time: 10,
    ui: 30,
    color: "#cccccc",
  });

  printControls();
}

printControls();
