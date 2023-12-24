let net;
let scorePlayer = 0;
let scoreComputer = 0;
let countdownInterval;
let isGameRunning = false;
// Function to simulate the computer's choice
function computerPlay() {
  const choices = ['Rock', 'Paper', 'Scissor'];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

// Function to decide the winner
function decideWinner(playerChoice, computerChoice) {
  console.log(playerChoice)
  if (playerChoice === computerChoice) {
    return 'draw';
  } else if (
    (playerChoice === 'Rock' && computerChoice === 'Scissor') ||
    (playerChoice === 'Scissor' && computerChoice === 'Paper') ||
    (playerChoice === 'Paper' && computerChoice === 'Rock')
  ) {
    scorePlayer++;
    return 'player';
  } else {
    scoreComputer++;
    return 'computer';
  }
}




// Function to update the scoreboard
function updateScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.textContent = `Player: ${scorePlayer} - Computer: ${scoreComputer}`;
}



async function app() {
  console.log('Loading model..');
  //Load the model.
  net = await tmImage.load('model/model.json', 'model/metadata.json');
  console.log('Successfully loaded model');

  // // Setup webcam
  const webcam = new tmImage.Webcam(200, 200, true);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  // // Append elements to the DOM
  document.getElementById('myVidPlayer').appendChild(webcam.canvas);

  function loop() {
    webcam.update();
    window.requestAnimationFrame(loop);
  }


  function startCountdown() {
    let countdown = 3;
    const countdownElement = document.getElementById('countdown');
    countdownElement.innerText = countdown; // Display initial countdown value

    countdownInterval = setInterval(() => {
        countdown -= 1;
        countdownElement.innerText = countdown;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownElement.innerText = '';
            predict(); // Start the game round
        }
    }, 1000); // 1000 milliseconds = 1 second
  }

  // Predict the gesture
  async function predict() {
    console.log("Button is clicked")

    const prediction = await net.predict(webcam.canvas);
    // Find the prediction with the highest probability
    let highestProbability = 0;
    let playerChoice = '';

    for (let i = 0; i < prediction.length; i++) {
        console.log(`Prediction for ${prediction[i].className} is ${prediction[i].probability}`)
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            playerChoice = prediction[i].className;
        }
    }

    console.log(`Predicted choice: ${playerChoice} with probability ${highestProbability}`);
    const computerChoice = computerPlay();
    const winner = decideWinner(playerChoice, computerChoice);
    
    let resultMessage = `Player chooses ${playerChoice}. Computer chooses ${computerChoice}. `;
    resultMessage += winner === 'draw' ? "It's a draw." : `The ${winner} wins this round.`;
    document.getElementById('result').textContent = resultMessage;

    updateScoreboard();
    setTimeout(startCountdown, 3000);
  }

  function toggleGame() {
    const toggleButton = document.getElementById('toggleButton');

    if (!isGameRunning) {
        // Start the game
        isGameRunning = true;
        toggleButton.innerText = 'Stop Game';
        startCountdown();
    } else {
        // Stop the game
        isGameRunning = false;
        toggleButton.innerText = 'Start Game';

        if (countdownInterval) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerText = '';
        }

        // Additional logic to handle game stop
        // e.g., reset the game state, clear results, etc.
    }
  }

  document.getElementById('toggleButton').addEventListener('click', toggleGame);
}






document.addEventListener('DOMContentLoaded', (event) => {
//Selector for your <video> element
    const video = document.querySelector('#myVidPlayer');

    //Core
    window.navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = (e) => {
                video.play();
            };
        })
        .catch( () => {
            alert('You have give browser the permission to run Webcam and mic ;( ');
        });
});



app();
