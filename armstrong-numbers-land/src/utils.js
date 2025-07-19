export const generateQuizNumber = () => {
  // 100에서 999 사이의 3자리 숫자 생성
  return Math.floor(Math.random() * 900) + 100;
};

export const isArmstrongNumber = (num) => {
  let sum = 0;
  const digits = String(num).split('').map(Number);

  for (let i = 0; i < digits.length; i++) {
    sum += Math.pow(digits[i], 3);
  }
  return { isArmstrong: sum === num, sumOfCubes: sum };
};

export const getCubedDigits = (num) => {
  const digits = String(num).split('').map(Number);
  return digits.map(digit => Math.pow(digit, 3));
};