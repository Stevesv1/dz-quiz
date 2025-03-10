let currentQuestion = 0;
let userAnswers = [];
let selectedQuestions = [];
let allQuestions = [];
let timeLeft = 60;
let timerInterval;

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

const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone'];
const userAgent = navigator.userAgent;
const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));

if (isMobile) {
    introContainer.style.display = 'none';
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'block';
} else {
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

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function getRandomQuestions(questions, num) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

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

function showQuestion(index) {
    const q = selectedQuestions[index];
    progressText.textContent = `Question ${index + 1} of 10`;
    questionText.textContent = q.question;

    const choicesWithIndices = q.choices.map((choice, i) => ({ text: choice, index: i }));
    const shuffledChoices = shuffleArray(choicesWithIndices);

    choicesDiv.innerHTML = '';
    shuffledChoices.forEach((choiceObj, i) => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'choice';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'choice';
        radio.value = i;
        radio.id = `choice${i}`;
        const label = document.createElement('label');
        label.htmlFor = `choice${i}`;
        label.textContent = choiceObj.text;
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
            const selectedShuffledIndex = parseInt(radio.value);
            const selectedOriginalIndex = shuffledChoices[selectedShuffledIndex].index;
            const isCorrect = selectedOriginalIndex === q.correct;
            choiceDiv.className += isCorrect ? ' correct' : ' wrong';
            choicesDiv.querySelectorAll('input').forEach(r => r.disabled = true);
            if (isCorrect) {
                correctSound.play();
            } else {
                incorrectSound.play();
            }
            userAnswers.push(selectedOriginalIndex);
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

function calculateScore() {
    let score = 0;
    for (let i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i] === Number(selectedQuestions[i].correct)) score++;
    }
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    scoreText.textContent = `You scored ${score} out of 10`;
}

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

shareButton.addEventListener('click', () => {
    const score = scoreText.textContent.split(' ')[2];
    const tweetText = `I scored ${score}/10 on the @DoubleZero quiz game, created by @Zun2025\n\nDoubleZero learners, can you beat me?\n\nTry out this game : https://doublezero-quiz.vercel.app`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
});

document.getElementById('start-button').addEventListener('click', startQuiz);
document.getElementById('replay-button').addEventListener('click', startQuiz);
