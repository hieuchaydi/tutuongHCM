let isExamInProgress = false;
let userAnswers = [];
let correctAnswers = 0;
let timerInterval; // Biến để quản lý bộ đếm thời gian

// Start individual exam from a specific JSON file
function startExam(file) {
    if (isExamInProgress) {
        alert("Bạn phải nộp bài hiện tại trước khi bắt đầu bài mới.");
        return;
    }

    fetch(file)
        .then(response => response.json())
        .then(data => {
            const randomQuestions = getRandomQuestions(data, 10);
            displayQuestions(randomQuestions);
            startTimer(15 * 60); // 15 phút
            isExamInProgress = true;
        })
        .catch(error => console.error("Lỗi khi tải file JSON:", error));
}

// Start final exam with 40 random questions from all JSON files
function startExamForAll() {
    if (isExamInProgress) {
        alert("Bạn phải nộp bài hiện tại trước khi bắt đầu bài mới.");
        return;
    }

    const files = ['data/bai1.json', 'data/bai2.json', 'data/bai3.json'];
    const questions = [];

    Promise.all(files.map(file => fetch(file).then(response => response.json())))
        .then(results => {
            results.forEach(result => questions.push(...result));
            const randomQuestions = getRandomQuestions(questions, 40); // Lấy 40 câu hỏi
            displayQuestions(randomQuestions);
            startTimer(45 * 60); // 45 phút
            isExamInProgress = true;
        })
        .catch(error => console.error("Lỗi khi tải file JSON:", error));
}

// Randomly select 'count' questions from a list
function getRandomQuestions(questions, count) {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Display questions on the page
function displayQuestions(questions) {
    const questionsContainer = document.getElementById("questions");
    questionsContainer.innerHTML = "";

    questions.forEach((question, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question");
        questionDiv.dataset.correctAnswer = question.correct_answer;

        const questionText = document.createElement("p");
        questionText.textContent = `${index + 1}. ${question.question_direction}`;
        questionDiv.appendChild(questionText);

        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options");

        question.answer_option.forEach(option => {
            const label = document.createElement("label");
            label.classList.add("option-label");

            const input = document.createElement("input");
            input.type = "radio";
            input.name = `question${index}`;
            input.value = option.id;

            input.addEventListener("change", enableSubmitEarly);

            label.appendChild(input);
            label.appendChild(document.createTextNode(option.value));
            optionsContainer.appendChild(label);
        });

        questionDiv.appendChild(optionsContainer);
        questionsContainer.appendChild(questionDiv);
    });
}

// Start the timer
function startTimer(duration) {
    const timerElement = document.getElementById("timer");
    let remainingTime = duration;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerElement.textContent = `Thời gian còn lại: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            alert("Hết giờ! Hệ thống sẽ tự động nộp bài.");
            submitExam();
        }

        remainingTime--;
    }, 1000);
}

// Enable early submission
function enableSubmitEarly() {
    const questions = document.querySelectorAll('.question');
    let allAnswered = true;

    questions.forEach(questionDiv => {
        const selectedOption = questionDiv.querySelector('input[type="radio"]:checked');
        if (!selectedOption) {
            allAnswered = false;
        }
    });

    const earlySubmitInfo = document.getElementById("early-submit-info");
    const submitBtn = document.getElementById("submit-btn");

    if (allAnswered) {
        earlySubmitInfo.style.display = "block";
        submitBtn.style.display = "block";
    } else {
        earlySubmitInfo.style.display = "none";
        submitBtn.style.display = "none";
    }
}

// Submit exam and display results
function submitExam() {
    clearInterval(timerInterval);

    const questionsContainer = document.getElementById("questions");
    const resultContainer = document.getElementById("result");
    const scoreElement = document.getElementById("score");

    correctAnswers = 0;
    userAnswers = [];

    const questions = document.querySelectorAll('.question');
    questions.forEach((questionDiv, index) => {
        const question = questionDiv.querySelector('p').textContent;
        const selectedOption = questionDiv.querySelector('input[type="radio"]:checked');
        const correctAnswer = questionDiv.dataset.correctAnswer;

        let userAnswerText = "Chưa chọn";
        if (selectedOption) {
            const userAnswer = selectedOption.value;
            const correctOption = questionDiv.querySelector(`input[value="${correctAnswer}"]`).nextSibling.textContent;
            userAnswerText = selectedOption.nextSibling.textContent;

            userAnswers.push({ question, userAnswer: userAnswerText, correctAnswer: correctOption });

            // Compare as strings to support both int and string
            if (userAnswer.toString() === correctAnswer.toString()) {
                correctAnswers++;
            }
        } else {
            const correctOption = questionDiv.querySelector(`input[value="${correctAnswer}"]`).nextSibling.textContent;
            userAnswers.push({ question, userAnswer: "Chưa chọn", correctAnswer: correctOption });
        }
    });

    const totalQuestions = questions.length;
    const score = ((correctAnswers / totalQuestions) * 10).toFixed(2);

    questionsContainer.innerHTML = "<h2>Kết quả bài kiểm tra</h2>";
    userAnswers.forEach((answer, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add(answer.userAnswer === answer.correctAnswer ? 'correct' : 'incorrect');
        answerDiv.innerHTML = `
            <p><strong>Câu ${index + 1}:</strong> ${answer.question}</p>
            <p><strong>Đáp án bạn chọn:</strong> ${answer.userAnswer}</p>
            <p><strong>Đáp án đúng:</strong> ${answer.correctAnswer}</p>
        `;
        questionsContainer.appendChild(answerDiv);
    });

    scoreElement.textContent = `Điểm của bạn: ${score} (Số câu trả lời đúng: ${correctAnswers}/${totalQuestions})`;
    resultContainer.style.display = "block";
    document.getElementById("submit-btn").style.display = "none";
    isExamInProgress = false;
}
