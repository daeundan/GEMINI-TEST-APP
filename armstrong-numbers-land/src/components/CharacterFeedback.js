import React from "react";
import "./CharacterFeedback.css";
import duckHappy from "../assets/duck_happy.png"; // 행복한 오리 이미지 (가정)
import duckSad from "../assets/duck_sad.png"; // 슬픈 오리 이미지 (가정)
import duckNeutral from "../assets/duck_neutral.png"; // 보통 오리 이미지 (가정)

function CharacterFeedback({ message, isCorrect }) {
  let duckImage = duckNeutral;
  if (isCorrect === true) {
    duckImage = duckHappy;
  } else if (isCorrect === false) {
    duckImage = duckSad;
  }

  return (
    <div className="character-feedback">
      <img src={duckImage} alt="Duck Character" className="duck-image" />
      <p className="feedback-message">{message}</p>
    </div>
  );
}

export default CharacterFeedback;
