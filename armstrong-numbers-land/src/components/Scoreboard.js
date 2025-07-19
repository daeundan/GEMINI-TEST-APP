
import React from 'react';
import './Scoreboard.css';

function Scoreboard({ score, level }) {
  return (
    <div className="scoreboard">
      <div className="score">점수: {score}</div>
      <div className="level">레벨: {level}</div>
    </div>
  );
}

export default Scoreboard;
