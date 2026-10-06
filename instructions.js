
let actualStep = 0;

nextStepButtonClicked();

function nextStepButtonClicked() {

    actualStep++;

    document.getElementById('actualStep').textContent = 'Schritt ' + actualStep;

    if (actualStep == 1) {
        document.getElementById('stepContentImage').innerHTML = '<img id="step1Image" src="img/instruction/step1.jpg" alt="Step 1 Image">';
        document.getElementById('stepContentText').textContent = 'Verwendete Geräte: Funduino Uno, Ultraschallsensor HC-SR04.';
    }
    else if (actualStep == 2) {
        document.getElementById('stepContentImage').innerHTML = '<img id="step2Image" src="img/instruction/step2.png" alt="Step 2 Image">';
        document.getElementById('stepContentText').textContent = 'Verbinde den Funduino mit dem Ultraschallsensor.';
    }
    else if (actualStep == 3) {
        document.getElementById('stepContentImage').innerHTML = '';
        document.getElementById('stepContentText').innerHTML = '<button id="flashButton" onclick="uploadFirmware()">Software flashen</button> <p id="statusText">Aktueller Status</p>Lade nun die Software auf den Funduino hoch.</button>';
    }
    else {
        document.getElementById('stepContentImage').innerHTML = '';
        document.getElementById('stepContentText').textContent = 'Fertig! Du kannst nun den MotionTracer verwenden.';
        document.querySelector('button').style.display = 'none'; // Hide the button after the last step
    }


}

async function uploadFirmware() {
    const GITHUB_HEX_URL = 'https://raw.githubusercontent.com/DEIN_USERNAME/DEIN_REPO/main/dein_programm.hex';
    // Hier kannst du den Code zum Hochladen der Firmware einfügen
    console.log('Firmware wird hochgeladen...');


    // Prüfen, ob der Browser Web Serial unterstützt
    if (!('serial' in navigator)) {
        statusText.innerText = 'Fehler: Web Serial wird von diesem Browser nicht unterstützt. Bitte Chrome oder Edge nutzen.';
        return;
    }

    try {

        const response = await fetch(GITHUB_HEX_URL);
        if (!response.ok) throw new Error('Hex-Datei konnte nicht geladen werden.');
        const hexData = await response.text();

        statusText.innerText = 'Bitte wähle den COM-Port deines Funduino aus...';

        // AVRGirl-Instanz für Uno initialisieren
        const avrgirl = new AvrgirlArduino({
            board: 'uno',
            debug: true
        });

        statusText.innerText = 'Übertragung läuft... Bitte nicht trennen!';

        // Flashen starten
        avrgirl.flash(hexData, (error) => {
            if (error) {
                console.error(error);
                statusText.innerText = 'Fehler beim Übertragen: ' + error.message;
            } else {
                statusText.innerText = 'Erfolgreich übertragen!';
            }
        });

    } catch (err) {
        console.error(err);
        statusText.innerText = 'Fehler: ' + err.message;
    }
}

