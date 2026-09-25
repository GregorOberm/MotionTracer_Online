let port;
let reader;
let systemStatus = "disconnected";
//possible: "disconnected", "connected", "measuring", "error"
let keepReading = false; // Steuerung für die Leseschleif




let firstTimeStamp;
let TimeStampassigned = false;

//trace1 is always the data from the Arduino
let trace1 = {
  type: 'scatter',
  mode: 'lines',
  x: [],
  y: [],
  line: { color: 'blue',width: 4 },
  showlegend: false,
};
//trace2 is a line inside the plot 
let trace2 = {
  type: 'scatter',
  mode: 'lines',
  x: [],
  y: [],
  line: { color: 'orange',width: 4},
  showlegend: false
};

let data = [trace1, trace2];

let buffer = '';
let firstRead = true;

const standardlayout = {
  xaxis: {
    title: {
      text: "Zeit/[s]"
    }, range: [-3, 10],
    tickmode: 'array',
    tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ticktext: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    fixedrange: true // Verhindert das Zoomen auf der X-Achse
  },
  shapes: [
    {
      type: 'rect',
      xref: 'x',
      yref: 'paper', // Reicht über die gesamte Höhe des Diagramms
      x0: -3,
      x1: 0,
      y0: 0,
      y1: 1,
      fillcolor: 'lightgray',
      opacity: 0.5,
      layer: 'below',
      line: {
        width: 0
      }
    }
  ],
  yaxis: { title: { text: "Position /[cm]" }, range: [0, 50],fixedrange: true }, // Verhindert das Zoomen auf der Y-Achse
  legend: false,
  dragmode: 'pan', // Standardmäßig auf "pan" setzen
};

const configPlot = {
  modeBarButtonsToRemove: [
    'zoom2d',
    'pan2d',
    'select2d',
    'lasso2d',
    'zoomIn2d',
    'zoomOut2d',
    'autoScale2d',
    'resetScale2d',
    'hoverClosestCartesian',
    'hoverCompareCartesian',
    'toggleSpikelines',
    'sendDataToCloud'
  ],
  displaylogo: false, // Blendet das Plotly-Logo aus
  showSendToCloud: false // Blendet die Option "Send to Cloud" aus
};




generatePlot();
setSystemStatus("disconnected");


if (!('serial' in navigator)) {
  alert('Die Web Serial API wird von Ihrem Browser leider nicht unterstützt (nutze z.B. Chrome oder Edge).');
}


connectButton.addEventListener("click", async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    connectButton.innerText = "Connected";
    connectButton.disabled = true;
    setSystemStatus("connected");
    

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);

    const inputStream = textDecoder.readable;
    reader = inputStream.getReader();
    readSerialData();
  } catch (error) {
    console.error("Error opening serial port:", error);
  }
});

navigator.serial.addEventListener("disconnect", (e) => {
  console.log("Device disconnected:", e);
  connectButton.innerText = "Connect to Arduino";
  connectButton.disabled = false;
  setSystemStatus("disconnected");
});

navigator.serial.addEventListener("connect", (e) => {

  console.log("Device connected:", e);
  connectButton.innerText = "Connected";
  connectButton.disabled = true;
  setSystemStatus("connected");

  
});

function generatePlot() {

  Plotly.newPlot("myPlot", data, standardlayout, configPlot);
  drawStandardLine(myPlot, standardlayout);
}

function startMeasurement() {
  if (systemStatus === "connected" || systemStatus === "measuring") {
    console.log("Starting measurement...");
    setSystemStatus("measuring");
    keepReading = true;
    resetPlot();
    readSerialData();
  }
}

function updatePlot(x, y) {

  console.log("Updating plot with x:", x, "y:", y);
  Plotly.extendTraces("myPlot", {
    x: [[x - 3]],
    y: [[y]],
  }, [1]);

}

function setStandardLayout(Plot) {
  standardlayout.dragmode = 'pan'; // Setze den Drag-Modus auf "select"
  standardlayout.shapes = [
    {
      type: 'rect',
      xref: 'x',
      yref: 'paper', // Reicht über die gesamte Höhe des Diagramms
      x0: -3,
      x1: 0,
      y0: 0,
      y1: 1,
      fillcolor: 'lightgray',
      opacity: 0.5,
      layer: 'below',
      line: {
        width: 0
      }
    }
  ];
  Plotly.relayout(Plot, standardlayout);
  console.log("Standardlayout wurde gesetzt.");
  console.log(standardlayout);
}



function resetPlot() {
  // 1. Lokale Arrays leeren
  const updatedata = {
    x: [[]],
    y: [[]],
  };
  // Timestamps für die neue Messung zurücksetzen
  firstTimeStamp = null;
  TimeStampassigned = false;

  // Puffer leeren (falls noch alte Reste vorhanden sind)
  buffer = "";
  firstRead = true;



  Plotly.restyle("myPlot", updatedata, [1]);
  console.log("Plot und Daten wurden zurückgesetzt.");


  document.getElementById("receivedData").innerHTML = '';
}


async function readSerialData() {
  const messageElement = document.getElementById("message");
  while (reader) {
    console.log("Reading serial data...");
    try {
      const { value, done } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }

      if (value) {
        buffer += value;
        let lines = buffer.split('\n');
        if (firstRead === true) {
          firstRead = false;
          continue; // Überspringe die erste Zeile, die möglicherweise unvollständig ist

        }

        // Das letzte Element im Array ist eventuell unvollständig, 
        // daher bleibt es im Puffer für den nächsten Durchlauf
        buffer = lines.pop();

        for (const line of lines) {
          const trimmedLine = line.trim(); // Steuerzeichen (\r) entfernen
          const daten = trimmedLine.split(',');

          if (daten.length === 3) {
            const rawTime = parseFloat(daten[0]);
            const val1 = parseFloat(daten[1]);

            if (!isNaN(rawTime) && !isNaN(val1)) {
              if (!TimeStampassigned) {
                firstTimeStamp = rawTime;
                TimeStampassigned = true;
                console.log("First timestamp assigned:", firstTimeStamp);
              }

              const timeInSeconds = (rawTime - firstTimeStamp) / 1000;
              if (timeInSeconds < 13 && systemStatus === "measuring") {
                updatePlot(timeInSeconds, val1);
                checkOutOfBounds(timeInSeconds, val1);
                document.getElementById("receivedData").innerHTML += trimmedLine + "<br>";
              }
              else {
                setSystemStatus("connected");
              }

              //messageElement.innerHTML += trimmedLine + "<br>";
            }
          }
        }
      }
    } catch (error) {
      console.error("Fehler beim Lesen des seriellen Streams:", error);
      break;
    } finally {
      //if(reader){
      //  reader.releaseLock();
      //}
    }
  }
}

function checkOutOfBounds(x,y) {
  const annotations = [];
  if (y < 0 || y > 40) {
    document.getElementById("message").innerHTML = "Warnung: Der Wert liegt außerhalb des zulässigen Bereichs (0-40 cm).";
  }
  else{
    document.getElementById("message").innerHTML = "";
  }
  
}

function setSystemStatus(newStatus) {
  systemStatus = newStatus;
  console.log("System status changed to:", systemStatus);

  if(systemStatus === "disconnected") {
    document.getElementById("statusInfo").innerHTML = "<br> Status: Disconnected";
    document.getElementById("connectButton").style.display ="inline-block";
    document.getElementById("startButton").style.display ="none";
  }
  else if(systemStatus === "connected") {
    document.getElementById("statusInfo").innerHTML = "<br> Status: Connected";
    document.getElementById("connectButton").style.display ="none";
    document.getElementById("startButton").style.display ="inline-block";
  }
  else if(systemStatus === "measuring") {
    document.getElementById("statusInfo").innerHTML = "<br> Status: Measuring";
  }
}
