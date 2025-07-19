import React, { useState, useEffect } from 'react';
import './App.css';
import QuizScreen from './components/QuizScreen';
import CharacterFeedback from './components/CharacterFeedback';
import Scoreboard from './components/Scoreboard';
import { generateQuizNumber, isArmstrongNumber, getCubedDigits } from './utils';

function App() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [quizNumber, setQuizNumber] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null); // true: 정답, false: 오답, null: 피드백 없음
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      startNewQuiz();
    }
  }, [gameStarted]);

  const startNewQuiz = () => {
    const num = generateQuizNumber();
    setQuizNumber(num);
    setIsCorrectAnswer(null);
  };

  const handleAnswer = (userAnswerIsArmstrong) => {
    const { isArmstrong, sumOfCubes } = isArmstrongNumber(quizNumber);
    const actualIsArmstrong = isArmstrong;
    const correct = userAnswerIsArmstrong === actualIsArmstrong;

    if (correct) {
      setScore(score + 10);
      const cubedDigits = getCubedDigits(quizNumber);
      const calculationString = cubedDigits.join(' + ');
      setFeedbackMessage(
        `정답! ${quizNumber}는 암스트롱 수예요. 각 자릿수의 세제곱의 합(${calculationString})이 자기 자신과 같거든요!`
      );
      setIsCorrectAnswer(true);
      // 레벨업 로직 (예: 5문제 맞출 때마다 레벨업)
      if ((score + 10) % 50 === 0) {
        setLevel(level + 1);
        setFeedbackMessage('레벨업! 오리가 더 똑똑해졌어요!');
      }
    } else {
      setScore(Math.max(0, score - 5)); // 오답 시 점수 감소, 0점 이하로 내려가지 않음
      const cubedDigits = getCubedDigits(quizNumber);
      const calculationString = cubedDigits.join(' + ') + ` = ${sumOfCubes}`;
      setFeedbackMessage(
        `아쉬워요! 조금만 더 생각해볼까요? 힌트: 각 자릿수를 세제곱해서 더해보세요. (${calculationString})`
      );
      setIsCorrectAnswer(false);
    }

    setTimeout(() => {
      startNewQuiz();
      setFeedbackMessage(''); // 피드백 메시지 초기화
    }, 3000); // 3초 후 다음 퀴즈 시작 (설명 볼 시간)
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>암스트롱 수 퀴즈</h1>
      </header>
      <main>
        {!gameStarted ? (
          <div className="start-screen">
            <h2>오리 친구와 함께 암스트롱 수의 비밀을 풀어봐!</h2>
            <button onClick={() => setGameStarted(true)}>게임 시작</button>
          </div>
        ) : (
          <>
            <Scoreboard score={score} level={level} />
            <CharacterFeedback message={feedbackMessage} isCorrect={isCorrectAnswer} />
            {quizNumber && (
              <QuizScreen
                number={quizNumber}
                onAnswer={handleAnswer}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;