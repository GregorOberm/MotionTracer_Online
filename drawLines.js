function drawStandardLine(Plot) {
    var ylim1 = 0;
    var ylim2 = 50;
    const updatedata = {
        x: [[0, 10]], // X-Werte für die Linie
        y: [[20, 40]], // Y-Werte für die Linie (z.B. 20 cm)
    };
    console.log("Layout to standard");
    setStandardLayout(Plot);

    Plotly.restyle(Plot, updatedata, [0]);

    const updateLayout = {
        'yaxis.range': [ylim1, ylim2] // Beachte: Bei relayout nur ein einfaches Array [min, max]
    };

    Plotly.relayout(Plot, updateLayout);
    console.log("Standardlinie wurde gezeichnet.");
    console.log(updatedata);
}

function drawLine1(Plot) {

    drawStandardLine(Plot);
    document.getElementById('myModal').close();
}

function drawLine2(Plot) {
    var ylim1 = 0;
    var ylim2 = 50;
    const updatedata = {
        x: [[0, 10]], // X-Werte für die Linie
        y: [[40, 20]], // Y-Werte für die Linie (z.B. 20 cm)

    };

    console.log("Layout to standard");
    setStandardLayout(Plot);


    Plotly.restyle(Plot, updatedata, [0]);

    const updateLayout = {
        'yaxis.range': [ylim1, ylim2] // Beachte: Bei relayout nur ein einfaches Array [min, max]
    };

    Plotly.relayout(Plot, updateLayout);
    console.log("Standardlinie wurde gezeichnet.");
    console.log(updatedata);
    document.getElementById('myModal').close();
}

function drawLine3(Plot) {
    var ylim1 = 0;
    var ylim2 = 50;
    const updatedata = {
        x: [[0, 10]], // X-Werte für die Linie
        y: [[40, 40]], // Y-Werte für die Linie (z.B. 20 cm)

    };

    console.log("Layout to standard");
    setStandardLayout(Plot);


    Plotly.restyle(Plot, updatedata, [0]);

    const updateLayout = {
        'yaxis.range': [ylim1, ylim2] // Beachte: Bei relayout nur ein einfaches Array [min, max]
    };

    Plotly.relayout(Plot, updateLayout);
    console.log("Standardlinie wurde gezeichnet.");
    console.log(updatedata);
    document.getElementById('myModal').close();
}

function drawLine4(Plot) {
    var ylim1 = 0;
    var ylim2 = 50;
    const updatedata = {
        x: [[0, 10]], // X-Werte für die Linie
        y: [[-40, -40]], // Y-Werte für die Linie (z.B. 20 cm)
        'yaxis.range': [[-50, 0]] // Setze die y-Achsen-Grenzen auf -50 bis 0

    };

    console.log("Layout to standard");
    setStandardLayout(Plot);


    Plotly.restyle(Plot, updatedata, [0]);

    const updateLayout = {
        'yaxis.range': [-50, 0] // Beachte: Bei relayout nur ein einfaches Array [min, max]
    };
    Plotly.relayout(Plot, updateLayout);


    console.log("Standardlinie wurde gezeichnet.");
    console.log(updatedata);
    document.getElementById('myModal').close();
}

function drawLine5(Plot) {
    var ylim1 = -50;
    var ylim2 = 50;
    const updatedata = {
        x: [[0, 10]], // X-Werte für die Linie
        y: [[40, -40]], // Y-Werte für die Linie (z.B. 20 cm)
    };

    console.log("Layout to standard");
    setStandardLayout(Plot);


    Plotly.restyle(Plot, updatedata, [0]);

    const updateLayout = {
        'yaxis.range': [ylim1, ylim2] // Beachte: Bei relayout nur ein einfaches Array [min, max]
    };

    Plotly.relayout(Plot, updateLayout);
    console.log("Standardlinie wurde gezeichnet.");
    console.log(updatedata);
    document.getElementById('myModal').close();
}

function drawLine6(Plot) {
    var ylim1 = 0;
    var ylim2 = 50;
    const updatedata = {
        x: [[0, 4, 8, 10]], // X-Werte für die Linie
        y: [[20, 40, 40, 20]], // Y-Werte für die Linie (z.B. 20 cm)

    };

    console.log("Layout to standard");
    setStandardLayout(Plot);


    Plotly.restyle(Plot, updatedata, [0]);
    const updateLayout = {
        'yaxis.range': [ylim1, ylim2] // Beachte: Bei relayout nur ein einfaches Array [min, max]
    };
    Plotly.relayout(Plot, updateLayout);
    console.log("Standardlinie wurde gezeichnet.");
    console.log(updatedata);
    document.getElementById('myModal').close();
}

function drawLine7(Plot) {
    var ylim1 = 0;
    var ylim2 = 50;
    const updatedata = {
        x: [[0, 2, 8, 10]], // X-Werte für die Linie
        y: [[40, 40, 10, 10]], // Y-Werte für die Linie (z.B. 20 cm)

    };

    console.log("Layout to standard");
    setStandardLayout(Plot);


    Plotly.restyle(Plot, updatedata, [0]);

    const updateLayout = {
        'yaxis.range': [ylim1, ylim2] // Beachte: Bei relayout nur ein einfaches Array [min, max]
    };

    Plotly.relayout(Plot, updateLayout);
    console.log("Standardlinie wurde gezeichnet.");
    console.log(updatedata);
    document.getElementById('myModal').close();
}

function drawLine8(Plot) {

    drawLine9(Plot);

    var ylim1 = 0;
    var ylim2 = 50;
    console.log("Layout to standard");
    setStandardLayout(Plot);

    Plotly.relayout(Plot, { dragmode: 'drawopenpath' });
    console.log("Standardlinie wurde gezeichnet.");
    document.getElementById('myModal').close();

    const updateLayout = {
        'yaxis.range': [ylim1, ylim2] // Beachte: Bei relayout nur ein einfaches Array [min, max]
    };

    Plotly.relayout(Plot, updateLayout);
}


function drawLine9(Plot) {
    var ylim1 = 0;
    var ylim2 = 100;

    document.getElementById("ymax-input").value = ylim2;
    document.getElementById("xmax-input").value = 10;

    const updatedata = {
        x: [[]], // X-Werte für die Linie
        y: [[]], // Y-Werte für die Linie (z.B. 20 cm) 
    };

    Plotly.restyle(Plot, updatedata, [0]);

    const updateLayout = {
        'yaxis.range': [ylim1, ylim2], // Beachte: Bei relayout nur ein einfaches Array [min, max]
        //'yaxis.fixedrange' : false,
        'yaxis.rangemode': 'tozero'
    };

    Plotly.relayout(Plot, updateLayout);
    console.log("Standardlinie wurde gezeichnet.");
    console.log(updatedata);
    document.getElementById('myModal').close();

    document.getElementById("label-ymax-input").hidden = false;
    document.getElementById("ymax-input").hidden = false;
    document.getElementById("label-xmax-input").hidden = false;
    document.getElementById("xmax-input").hidden = false;

}