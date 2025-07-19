import React from "react";
import { getCubedDigits } from "../utils";
import "./QuizScreen.css";

function QuizScreen({ number, onAnswer }) {
  const cubedDigits = getCubedDigits(number);

  return (
    <div className="quiz-screen">
      <h3>이 숫자는 암스트롱 수일까요?</h3>
      <div className="hint-box">
        {cubedDigits.map((val, index) => (
          <span key={index} className="cubed-digit">
            {val}
          </span>
        ))}
      </div>
      <div className="answer-buttons">
        <button onClick={() => onAnswer(true)}>YES</button>
        <button onClick={() => onAnswer(false)}>NO</button>
      </div>
    </div>
  );
}

export default QuizScreen;
