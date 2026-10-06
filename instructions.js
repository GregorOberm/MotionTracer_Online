
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
        document.getElementById('stepContentText').innerHTML = '<button id="flashButton" type="button" onclick="uploadFirmware()">Software flashen</button><p id="statusText" role="status">Bereit.</p><p>Lade nun die Software auf den Funduino hoch.</p>';
    }
    else {
        document.getElementById('stepContentImage').innerHTML = '';
        document.getElementById('stepContentText').textContent = 'Fertig! Du kannst nun den MotionTracer verwenden.';
        document.getElementById('nextStepButton').style.display = 'none';
    }


}

function log(message) {
    const statusText = document.getElementById('statusText');
    if (statusText) statusText.textContent = message;
}

function parseHex(hexText) {
    const flashBytes = new Map();
    const flashLimit = 32 * 1024;
    let upperAddress = 0;
    let highestAddress = 0;
    let endOfFileFound = false;

    for (const [index, rawLine] of hexText.split(/\r?\n/).entries()) {
        const line = rawLine.trim();
        if (!line) continue;
        if (endOfFileFound) {
            throw new Error('Unerwartete Daten nach dem Dateiende der HEX-Datei.');
        }
        if (!line.startsWith(':') || line.length % 2 !== 1 || !/^[0-9a-f]+$/i.test(line.slice(1))) {
            throw new Error(`Ungültiger HEX-Eintrag in Zeile ${index + 1}.`);
        }

        const record = line.slice(1).match(/.{2}/g).map(byte => Number.parseInt(byte, 16));
        const byteCount = record[0];
        if (record.length !== byteCount + 5) {
            throw new Error(`Falsche Länge des HEX-Eintrags in Zeile ${index + 1}.`);
        }
        if ((record.reduce((sum, byte) => sum + byte, 0) & 0xff) !== 0) {
            throw new Error(`Prüfsummenfehler in HEX-Zeile ${index + 1}.`);
        }

        const address = (record[1] << 8) | record[2];
        const recordType = record[3];
        const data = record.slice(4, -1);

        if (recordType === 0) {
            for (let offset = 0; offset < data.length; offset++) {
                const absoluteAddress = upperAddress + address + offset;
                if (absoluteAddress >= flashLimit) {
                    throw new Error('Die Firmware ist größer als der 32-KB-Flash des Funduino Uno.');
                }
                flashBytes.set(absoluteAddress, data[offset]);
                highestAddress = Math.max(highestAddress, absoluteAddress + 1);
            }
        } else if (recordType === 1) {
            if (byteCount !== 0) {
                throw new Error(`Ungültiger Dateiende-Eintrag in Zeile ${index + 1}.`);
            }
            endOfFileFound = true;
        } else if (recordType === 2 || recordType === 4) {
            if (byteCount !== 2) {
                throw new Error(`Ungültiger Adress-Eintrag in Zeile ${index + 1}.`);
            }
            const extendedAddress = (data[0] << 8) | data[1];
            upperAddress = recordType === 2 ? extendedAddress * 16 : extendedAddress * 0x10000;
        } else if (recordType !== 3 && recordType !== 5) {
            throw new Error(`Nicht unterstützter HEX-Eintrag in Zeile ${index + 1}.`);
        }
    }

    if (!endOfFileFound || highestAddress === 0) {
        throw new Error('Die HEX-Datei ist unvollständig oder enthält keine Firmwaredaten.');
    }

    const pageSize = 128;
    const image = new Uint8Array(Math.ceil(highestAddress / pageSize) * pageSize).fill(0xff);
    for (const [address, byte] of flashBytes) image[address] = byte;
    return image;
}

async function loadFirmware() {
    const response = await fetch('Firmware/MotionTracer_Firmware_v3.ino.hex');
    if (!response.ok) {
        throw new Error(`Firmware-Datei konnte nicht geladen werden (HTTP ${response.status}).`);
    }
    return parseHex(await response.text());
}

async function uploadFirmware() {
    if (!('serial' in navigator)) {
        log('Web Serial wird nicht unterstützt. Bitte Chrome oder Edge über HTTPS verwenden.');
        return;
    }

    const flashButton = document.getElementById('flashButton');
    if (flashButton) flashButton.disabled = true;

    let port;
    let reader;
    let writer;
    let portOpened = false;

    try {
        port = await navigator.serial.requestPort();
        const binData = await loadFirmware();
        log(`Firmware geladen: ${binData.length} Bytes. Öffne Verbindung...`);

        await port.open({ baudRate: 115200 });
        portOpened = true;
        await port.setSignals({ dataTerminalReady: false });
        await new Promise(r => setTimeout(r, 100));
        await port.setSignals({ dataTerminalReady: true });
        await new Promise(r => setTimeout(r, 500));
        log('Bootloader wird synchronisiert...');

        reader = port.readable.getReader();
        writer = port.writable.getWriter();

        async function sendStkCommand(command) {
            await writer.write(new Uint8Array(command));
            const response = [];

            while (response.length < 2) {
                let timeoutId;
                const result = await Promise.race([
                    reader.read(),
                    new Promise(resolve => {
                        timeoutId = setTimeout(() => resolve(null), 3000);
                    })
                ]).finally(() => clearTimeout(timeoutId));

                if (!result) {
                    await reader.cancel();
                    throw new Error('Keine Antwort vom Bootloader erhalten.');
                }
                if (result.done) throw new Error('Serielle Verbindung wurde beendet.');
                response.push(...result.value);
            }

            if (response[0] !== 0x14 || response[1] !== 0x10) {
                throw new Error(`Ungültige Bootloader-Antwort: ${response.map(byte => byte.toString(16)).join(' ')}.`);
            }
        }

        await sendStkCommand([0x30, 0x20]);
        await sendStkCommand([0x50, 0x20]);
        log('Synchronisiert. Programmiere Firmware...');

        const pageSize = 128;
        for (let addr = 0; addr < binData.length; addr += pageSize) {
            const pageAddress = addr / 2;
            await sendStkCommand([0x55, pageAddress & 0xff, (pageAddress >> 8) & 0xff, 0x20]);

            const chunk = binData.slice(addr, addr + pageSize);
            await sendStkCommand([
                0x64,
                (chunk.length >> 8) & 0xff,
                chunk.length & 0xff,
                0x46,
                ...chunk,
                0x20
            ]);
            log(`Fortschritt: ${Math.min(addr + pageSize, binData.length)} / ${binData.length} Bytes`);
        }

        await sendStkCommand([0x51, 0x20]);
        log('Upload erfolgreich abgeschlossen!');

    } catch (err) {
        log(`Fehler: ${err.message}`);
    } finally {
        if (reader) {
            try { await reader.cancel(); } catch { }
            try { reader.releaseLock(); } catch { }
        }
        if (writer) {
            try { writer.releaseLock(); } catch { }
        }
        if (portOpened) {
            try { await port.close(); } catch { }
        }
        if (flashButton) flashButton.disabled = false;
    }
}

