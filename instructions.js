
let actualStep = 0;

nextStepButtonClicked();

function nextStepButtonClicked() {

    actualStep++;

    document.getElementById('actualStep').textContent = 'Schritt ' + actualStep;

    if(actualStep == 1){
        document.getElementById('stepContentImage').innerHTML = '<img id="step1Image" src="img/instruction/step1.jpg" alt="Step 1 Image">';
        document.getElementById('stepContentText').textContent = 'Verwendete Geräte: Funduino Uno, Ultraschallsensor HC-SR04.';
    }
    else if(actualStep == 2){
        document.getElementById('stepContentImage').innerHTML = '<img id="step2Image" src="img/instruction/step2.png" alt="Step 2 Image">';
        document.getElementById('stepContentText').textContent = 'Verbinde den Funduino mit dem Ultraschallsensor.';
    }
     else if(actualStep == 3){
        document.getElementById('stepContentImage').innerHTML = '<img id="step3Image" src="img/instruction/step3.png" alt="Step 3 Image">';
        document.getElementById('stepContentText').textContent = 'Lade nun die Software auf den Funduino hoch.';
    }
    else{
        document.getElementById('stepContentImage').innerHTML = '';
        document.getElementById('stepContentText').textContent = 'Fertig! Du kannst nun den MotionTracer verwenden.';
        document.querySelector('button').style.display = 'none'; // Hide the button after the last step
    }
    

}