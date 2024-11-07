let isExamInProgress = false;
let userAnswers = [];
let correctAnswers = 0;

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
            isExamInProgress = true;
            document.getElementById("submit-btn").style.display = "block";
        })
        .catch(error => console.error("Lỗi khi tải file JSON:", error));
}

function getRandomQuestions(questions, count) {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayQuestions(questions) {
    const questionsContainer = document.getElementById("questions");
    questionsContainer.innerHTML = ""; // Xóa nội dung cũ

    questions.forEach((question, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question");
        questionDiv.dataset.correctAnswer = question.correct_answer; // Đặt đáp án đúng vào thuộc tính data

        // Hiển thị câu hỏi
        const questionText = document.createElement("p");
        questionText.textContent = `${index + 1}. ${question.question_direction}`;
        questionDiv.appendChild(questionText);

        // Hiển thị các lựa chọn
        question.answer_option.forEach(option => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `question${question.id}`;
            input.value = option.id;
            label.appendChild(input);
            label.appendChild(document.createTextNode(option.value));
            questionDiv.appendChild(label);
        });

        questionsContainer.appendChild(questionDiv);
    });
}

function submitExam() {
    const questionsContainer = document.getElementById("questions");
    const resultContainer = document.getElementById("result");
    const scoreElement = document.getElementById("score");

    correctAnswers = 0;
    userAnswers = [];

    // Kiểm tra đáp án của người dùng
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

            if (userAnswer === correctAnswer) {
                correctAnswers++;
            }
        } else {
            const correctOption = questionDiv.querySelector(`input[value="${correctAnswer}"]`).nextSibling.textContent;
            userAnswers.push({ question, userAnswer: "Chưa chọn", correctAnswer: correctOption });
        }
    });

    // Hiển thị kết quả
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

    scoreElement.textContent = `Số câu trả lời đúng: ${correctAnswers}`;
    resultContainer.style.display = "block";
    document.getElementById("submit-btn").style.display = "none";
    isExamInProgress = false;
}
