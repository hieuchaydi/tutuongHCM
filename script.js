const subjects = {
    TTHCM: "TTHCM",
    TTNT: "TTNT"
}

const onlyDisplayNonAnswer = false;
let isExamInProgress = false;
let userAnswers = [];
let correctAnswers = 0;

// Start individual exam from a specific JSON file
function startExam(file) {
    if (isExamInProgress) {
        alert("Bạn phải nộp bài hiện tại trước khi bắt đầu bài mới.");
        return;
    }

    fetch(file)
        .then(response => response.json())
        .then(data => {
            const randomQuestions = getRandomQuestions(data, 10); // Lấy ngẫu nhiên 10 câu hỏi
            displayQuestions(randomQuestions);
            isExamInProgress = true;
            document.getElementById("submit-btn").style.display = "block"; // Hiển thị nút nộp bài
        })
        .catch(error => console.error("Lỗi khi tải file JSON:", error));
}

// Start final exam with 50 random questions from all JSON files
function startExamForAll(subject) {
    if (isExamInProgress) {
        alert("Bạn phải nộp bài hiện tại trước khi bắt đầu bài mới.");
        return;
    }

    let files = [];
    const questions = [];

    switch (subject) {
        case subjects.TTHCM:
            files.push('data/TTHCM1.json', 'data/TTHCM2.json', 'data/TTHCM3.json', 'data/TTHCM4.json', 'data/TTHCM5.json', 'data/TTHCM6.json', 'data/KTKiNang2.json');
            break;
        case subjects.TTNT:
            files.push('data/TTNT1.json', 'data/TTNT2.json', 'data/TTNT3.json', 'data/TTNT4.json', 'data/TTNT5.json', 'data/TTNT6.json', 'data/TTNT7.json', 'data/TTNT8.json', 'data/TTNT9.json')
            break;
    }

    // Fetch data from all files and combine into one array
    Promise.all(files.map(file => fetch(file).then(response => response.json())))
        .then(results => {
            results.forEach(result => {
              if (onlyDisplayNonAnswer == true) {
                result.forEach(question => {
                  if (question.correct_answer < 1 || question.correct_answer > 4)
                    questions.push(question);
                })
              }
              else {
                questions.push(...result)
              }
            }); // Gộp tất cả câu hỏi vào một mảng

            const randomQuestions = getRandomQuestions(questions, onlyDisplayNonAnswer ? questions.length : 50); // Lấy 50 câu hỏi ngẫu nhiên
            displayQuestions(randomQuestions); // Hiển thị câu hỏi
            isExamInProgress = true;
            document.getElementById("submit-btn").style.display = "block"; // Hiển thị nút nộp bài
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
    questionsContainer.innerHTML = ""; // Clear old content

  questions.forEach((question, index) => {
      const questionDiv = document.createElement("div");
      const questionHeaderDiv = document.createElement("div");

      questionDiv.classList.add("question");
      questionDiv.dataset.correctAnswer = question.correct_answer; // Store correct answer

      questionHeaderDiv.classList.add("question-header");

      // Display question text
      const questionNumber = document.createElement("p");
      const questionText = document.createElement("p");

      questionNumber.textContent = `Câu ${index + 1}: (ID - ${question.id})`
      questionNumber.classList.add("question-number");

      if (question.correct_answer == 0) {
        questionNumber.classList.add("question-no-answer");
      }

      questionText.innerHTML = `${question.question_direction}`;

      questionHeaderDiv.appendChild(questionNumber);
      questionHeaderDiv.appendChild(questionText);

      questionDiv.appendChild(questionHeaderDiv);

      const answerDiv = document.createElement("div");
      answerDiv.classList.add("answer-div");

      const optionLabels = ['A', 'B', 'C', 'D'];

      // Display answer options
      question.answer_option.forEach((option, optionIndex) => {
          const answerOpionDiv = document.createElement("div");
          const label = document.createElement("label");
          const input = document.createElement("input");
          const optionText = document.createElement("span");
          const optionTextP = document.createElement("p");
          const optionLabel = document.createElement("span");

          answerOpionDiv.classList.add("answer-option-div");
          
          optionLabel.classList.add("option-label-text");
          optionLabel.textContent = optionLabels[optionIndex];
          
          input.type = "radio";
          input.name = `question_${question.id}`;
          input.value = option.id;

          label.classList.add("option-label"); // Add a class for styling
          label.appendChild(input);
          label.appendChild(optionText);
          
          // Use innerHTML to render HTML content in the option value
          optionTextP.innerHTML = option.value;
          optionText.appendChild(optionTextP);
          
          answerOpionDiv.appendChild(optionLabel);
          answerOpionDiv.appendChild(label);
          answerDiv.appendChild(answerOpionDiv);

          input.addEventListener('change', () => {
            if (isExamInProgress) {
            document.querySelectorAll(`input[name="question_${question.id}"]`).forEach(radio => {
              radio.parentElement.classList.remove('selected');
            });
            if (input.checked) {
                label.classList.add('selected');
              }
            }
          });
      });

      questionDiv.appendChild(answerDiv);
      questionsContainer.appendChild(questionDiv);
  });
}

// Submit exam and display results
function submitExam() {
    const questionContainers = document.getElementsByClassName("question");
    const resultContainer = document.getElementById("result");
    const scoreElement = document.getElementById("score");

    correctAnswers = 0;
    userAnswers = [];

    // Check user answers
    const questions = document.querySelectorAll('.question');
    questions.forEach((questionDiv) => {
        const selectedOption = questionDiv.querySelector('input[type="radio"]:checked');
        const correctAnswer = questionDiv.dataset.correctAnswer;

        let userAnswerText = "Chưa chọn";
        if (selectedOption) {
            const userAnswer = selectedOption.value;
            const correctOption = questionDiv.querySelector(`input[value="${correctAnswer}"]`).nextSibling.textContent;

            userAnswerText = selectedOption.nextSibling.textContent;
            userAnswers.push({ userAnswer: userAnswerText, correctAnswer: correctOption });

            if (userAnswer === correctAnswer) {
                correctAnswers++;
                selectedOption.parentElement.classList.add('correct-answer');
            } else {
                selectedOption.parentElement.classList.add('incorrect-answer');
                questionDiv.querySelector(`input[value="${correctAnswer}"]`).parentElement.classList.add('correct-answer');
            }
        } else {
            const correctOption = questionDiv.querySelector(`input[value="${correctAnswer}"]`).nextSibling.textContent;

            userAnswers.push({ userAnswer: "Chưa chọn", correctAnswer: correctOption });
            questionDiv.querySelector(`input[value="${correctAnswer}"]`).parentElement.classList.add('unanswered');
        }

        // Hide radio buttons
        const radioButtons = questionDiv.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.classList.add('hidden-radio');
        });
    });

    // Display results
    const totalQuestions = questions.length;
    const score = ((correctAnswers / totalQuestions) * 10).toFixed(2); // Score out of 10

    userAnswers.forEach((answer, index) => {
        const answerDiv = questionContainers[index];
        answerDiv.classList.add(answer.userAnswer === answer.correctAnswer ? 'correct' : 'incorrect');
    });

    scoreElement.textContent = `Điểm của bạn: ${score} (Số câu trả lời đúng: ${correctAnswers}/${totalQuestions})`;
    resultContainer.style.display = "block";
    document.getElementById("submit-btn").style.display = "none";
    isExamInProgress = false;
}
