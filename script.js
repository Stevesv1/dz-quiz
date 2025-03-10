// Game state
let currentQuestion = 0;
let userAnswers = [];
let selectedQuestions = [];
let allQuestions = [];
let timeLeft = 60;
let timerInterval;

// DOM elements
const introContainer = document.getElementById('intro-container');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const errorContainer = document.getElementById('error-container');
const questionText = document.getElementById('question-text');
const progressText = document.getElementById('progress-text');
const choicesDiv = document.getElementById('choices');
const timerDisplay = document.getElementById('timer');
const scoreText = document.getElementById('score-text');
const shareButton = document.getElementById('share-button');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');

// Device detection
const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone'];
const userAgent = navigator.userAgent;
const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));

// Initial display setup based on device
if (isMobile) {
    introContainer.style.display = 'none';
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'block';
} else {
    // Load questions only for allowed devices
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            allQuestions = data;
            introContainer.style.display = 'block';
            quizContainer.style.display = 'none';
            resultContainer.style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            introContainer.innerHTML = '<p>Failed to load questions. Please try again later.</p>';
            introContainer.style.display = 'block';
            quizContainer.style.display = 'none';
            resultContainer.style.display = 'none';
        });
}

// Function to get 10 random questions
function getRandomQuestions(questions, num) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// Start the timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time left: ${timeLeft} seconds`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            calculateScore();
        }
    }, 1000);
}

// Show the current question
function showQuestion(index) {
    const q = selectedQuestions[index];
    progressText.textContent = `Question ${index + 1} of 10`;
    questionText.textContent = q.question;
    choicesDiv.innerHTML = '';
    q.choices.forEach((choice, i) => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'choice';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'choice';
        radio.value = i;
        radio.id = `choice${i}`;
        const label = document.createElement('label');
        label.htmlFor = `choice${i}`;
        label.textContent = choice;
        choiceDiv.appendChild(radio);
        choiceDiv.appendChild(label);
        choicesDiv.appendChild(choiceDiv);

        choiceDiv.addEventListener('click', () => {
            if (!radio.disabled) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        });

        radio.addEventListener('change', () => {
            const selectedIndex = parseInt(radio.value);
            const isCorrect = selectedIndex === q.correct;
            choiceDiv.classList.add(isCorrect ? 'correct' : 'wrong');
            choicesDiv.querySelectorAll('input').forEach(r => r.disabled = true);
            if (isCorrect) {
                correctSound.play();
            } else {
                incorrectSound.play();
            }
            userAnswers.push(selectedIndex);
            setTimeout(() => {
                if (index < 9) {
                    currentQuestion++;
                    showQuestion(currentQuestion);
                } else {
                    clearInterval(timerInterval);
                    calculateScore();
                }
            }, 1000);
        });
    });
}

// Calculate and display score
function calculateScore() {
    let score = 0;
    for (let i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i] === selectedQuestions[i].correct) score++;
    }
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    scoreText.textContent = `You scored ${score} out of 10`;
}

// Start quiz
function startQuiz() {
    if (allQuestions.length === 0) {
        alert('Questions not loaded yet. Please wait.');
        return;
    }
    selectedQuestions = getRandomQuestions(allQuestions, 10);
    currentQuestion = 0;
    userAnswers = [];
    timeLeft = 60;
    timerDisplay.textContent = `Time left: ${timeLeft} seconds`;
    introContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    showQuestion(0);
    startTimer();
}

// Share score on X
shareButton.addEventListener('click', () => {
    const score = scoreText.textContent.split(' ')[2];
    const tweetText = `I scored ${score}/10 on the DoubleZero quiz game, created by @Zun2025!\n\nDoubleZero learners, can you beat me?\n\nTry out this game https://game.com`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
});

// Event listeners
document.getElementById('start-button').addEventListener('click', startQuiz);
document.getElementById('replay-button').addEventListener('click', startQuiz);