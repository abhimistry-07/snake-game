// Load the model.
let model;
const URL = "https://teachablemachine.withgoogle.com/models/Y49u_IwML/"; // Replace with your model URL

async function loadModel() {
    model = await tf.loadLayersModel(URL + "model.json");
}

async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL
    );

    await recognizer.ensureModelLoaded();

    return recognizer;
}

document.addEventListener("DOMContentLoaded", (event) => {
    // Get a reference to the game board
    let gameBoard = document.getElementById("game-board");

    // Create the dots and add them to the game board
    for (let row = 0; row < 30; row++) {
        for (let col = 0; col < 30; col++) {
            let dot = document.createElement("div");
            dot.classList.add("dot");
            gameBoard.appendChild(dot);
        }
    }

    function createSnake() {
        const body = [[0, 0]]; // Start in the center of the game board
        const direction = "Right"; // The direction the snake is currently moving in

        let initialSegment = document.getElementsByClassName("dot")[0 * 30 + 0];
        initialSegment.classList.add("snake");

        // Create a score variable
        let score = 0;

        // Get a reference to the score display
        let scoreDisplay = document.getElementById("score");

        function move() {
            // Get the coordinates of the head of the snake
            let head = body[0].slice(); // Copy the head

            // Update the head's coordinates based on the current direction
            switch (direction) {
                case "Up":
                    head[1]--;
                    break;
                case "Down":
                    head[1]++;
                    break;
                case "Left":
                    head[0]--;
                    break;
                case "Right":
                    head[0]++;
                    break;
            }

            // Check for collisions with the edge of the game board
            if (head[0] < 0 || head[1] < 0 || head[0] >= 30 || head[1] >= 30) {
                return false; // Game over
            }

            // Check for collisions with the snake's own body by seeing if any body segment has the same coordinates as the new head
            for (let i = 0; i < body.length; i++) {
                if (body[i][0] === head[0] && body[i][1] === head[1]) {
                    return false; // Game over
                }
            }

            // No collisions, so we can move the snake
            body.unshift(head); // Add the new head to the beginning of the body

            // If the snake didn't eat food, remove the last segment of the body
            if (
                body[0][0] !== food.position[0] ||
                body[0][1] !== food.position[1]
            ) {
                body.pop();
            } else {
                // The snake ate food, so create a new food and increase the score
                createNewFood();
                score++;
                scoreDisplay.textContent = "Score: " + score;
            }
            return true; // The snake successfully moved
        }

        // Changes the direction of the snake
        function turn(newDirection) {
            direction = newDirection;
        }

        return { body, direction, move, turn };
    }

    function createFood() {
        // Start with a random position for the food
        return {
            position: [
                Math.floor(Math.random() * 30),
                Math.floor(Math.random() * 30),
            ],
        };
    }

    // Create a new snake and a new food
    let snake = createSnake();
    let food = createFood();

    function drawSnake() {
        // Clear all dots from being a part of snake or food
        let dots = document.getElementsByClassName("dot");
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove("snake");
            dots[i].classList.remove("food");
        }

        // Draw the snake
        for (let i = 0; i < snake.body.length; i++) {
            let x = snake.body[i][0];
            let y = snake.body[i][1];
            dots[y * 30 + x].classList.add("snake");
        }

        // Draw the food
        let x = food.position[0];
        let y = food.position[1];
        dots[y * 30 + x].classList.add("food");
    }

    // Call this function whenever you need to create a new food
    function createNewFood() {
        food = createFood();
        drawSnake();
    }

    // Call this function in your setInterval loop
    function gameLoop() {
        if (!snake.move()) {
            // If move returns false, the game is over
            alert("Game over!");
        } else {
            // Check if the snake ate the food
            if (
                snake.body[0][0] === food.position[0] &&
                snake.body[0][1] === food.position[1]
            ) {
                // If it did, create a new food
                createNewFood();
            } else {
                drawSnake();
            }
        }
    }

    // Start the game loop
    setInterval(gameLoop, 800);

    // Load the model and initialize voice control
    loadModel();
});
