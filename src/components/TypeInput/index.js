import { Letter, StyledTypeInput } from "components/TypeInput/styles";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Paragraph } from "components/TypeInput/styles";
import { MOCKUP_STRING } from "constants/paragraphs";

function generateLetterStatus(currentInputString, letter, currentLetterIndex) {
  if (currentInputString.length === currentLetterIndex) {
    return "current"; // 현재 입력부
  }
  if (currentInputString.length - 1 < currentLetterIndex) {
    return "untyped"; // 아직 입력하지 않은 글자
  }
  if (currentInputString[currentLetterIndex] === letter) {
    return "correct"; // 입력을 했고, 맞는 글자
  }
  return "wrong"; // 입력은 했으나, 틀린 글자
}

// paragraph 받아서 \n (newline) 의 index 위치를 반환해줌
function parseNewline(paragraph) {
  let newLineIndices = [];
  for (var i = 0; i < paragraph.length; i++) {
    if (paragraph[i] === "\n") {
      newLineIndices.push(i);
    }
  }
  console.log("new line indices", newLineIndices);
  return newLineIndices;
}

const TEST_STRING_INDEX = 3;
const TEST_STRING = MOCKUP_STRING[TEST_STRING_INDEX];

function TypeInput({ timePassed, setCurrentKPM }) {
  // 타이머 관련
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);

  // 현재 입력받은 글자를 state 로 관리
  const [currentInputString, setCurrentInputString] = useState("");

  // 현재 오탈자 수를 state 로 관리
  const [mistakes, setMistakes] = useState(0);

  // 미모지 표정 관리용
  const [face, setFace] = useState("happy");

  // 줄이 바뀌는 index 따로 관리
  const breakpoints = useMemo(() => parseNewline(TEST_STRING), []);
  // 현재 매 line 의 끝에 와 있는지 아닌지 판단.
  // false: line 끝 아님. true: line 끝임.
  const EOLFlag = useRef(false);

  // 현재 타이핑이 끝났는지 점검하는 flag
  // false: 아직 끝에 못 도달함, true: 끝에 도달함.
  const EOFFlag = useRef(false);

  // 마지막에 타이머 초 0 으로 바꾸기 전에 마지막 경과 초 값 저장
  const totalSecondsSpent = useRef(0);

  // 줄 끝에서는 엔터를 쳐야지만 줄이 넘어가도록
  const enterPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        EOLFlag.current = false;
        setCurrentInputString(currentInputString + " ");
        document.removeEventListener("keydown", enterPress);
      }
    },
    [currentInputString]
  );

  const keyPress = useCallback(
    (e) => {
      // 직접 각 분기문에서 setState 사용 시 비동기(async) 로 처리되는
      // setState 때문에 오탈자 수를 정확히 셀 수가 없음.
      let tempInputString = currentInputString;

      // if Backspace < 이거 windows 대응 이슈 있을수도??
      if (e.keyCode === 8) {
        // 틀린 글자를 지우는 경우 mistakes 감소시키기
        setFace("sad");
        if (tempInputString.length === 0) {
          // 한 글자도 안 남은 경우 (mistakes 가 음수 되는 것 대응)
          setMistakes(0);
        } else if (tempInputString.slice(-1) !== TEST_STRING.charAt(tempInputString.length - 1)) {
          setMistakes(mistakes - 1);
        }
        tempInputString = tempInputString.slice(0, -1);
      }
      // 나머지 모든 키들에 대해서는
      else {
        // space 로 페이지 내려가는 문제 해결.
        if (e.keyCode === 32) {
          e.preventDefault();
        }
        if (!EOLFlag.current && !EOFFlag.current) {
          // 눌러진 키가 한 글자인지 점검하는 건 Control, Alt, Shift, Backsapce 등
          // 이런 실제 값이 아닌 조작용 키들이 바로 input 으로 먹어버리는 걸 검증하기 위함.
          if (e.key.length === 1) {
            tempInputString = tempInputString + e.key;
            // 마지막으로 들어온 글자와 비교기준 글자가 다를 경우, mistakes 증가시키기
            if (tempInputString.slice(-1) !== TEST_STRING.charAt(tempInputString.length - 1)) {
              setFace("sad");
              setMistakes(mistakes + 1);
            } else {
              setFace("happy");
            }
          }
          // console.log(e.key, "||", e.keyCode);
        }
      }
      setCurrentInputString(tempInputString);
      setCurrentKPM(Math.round(((currentInputString.length - mistakes) / timePassed) * 60));
    },
    [currentInputString, mistakes, setCurrentKPM, timePassed]
  );

  // 전체 문서에 대해 keydown event bind 시키기
  // TODO: 이거를 input 에만 bind 시켜야 할 거같은데?
  useEffect(() => {
    if (!EOLFlag.current && !EOFFlag.current) {
      document.addEventListener("keydown", keyPress);
    }
    return () => document.removeEventListener("keydown", keyPress);
  }, [keyPress]);

  useEffect(() => {
    // 만약 line 끝에 도달했다면
    if (breakpoints.includes(currentInputString.length)) {
      console.log("EOL");
      EOLFlag.current = true;
      if (!EOFFlag.current) {
        document.addEventListener("keydown", enterPress);
      }
    }
  }, [breakpoints, currentInputString, enterPress]);

  useEffect(() => {
    // 만약 file 끝에 도달했다면
    if (currentInputString.length === TEST_STRING.length) {
      // TODO: alert 의 문제 때문인지 alert 가 뜨고 마지막 글자가 렌더링됨. -> 빨리 custom modal 만들기
      // alert(
      //   `현재 타수 ${Math.round(
      //     ((currentInputString.length - mistakes) / (60 - seconds)) * 60
      //   )}, 오탈자: ${mistakes} 개`
      // );
      console.log("끝!");
      EOFFlag.current = true;
      console.log("EOF Flag", EOFFlag.current);
      totalSecondsSpent.current = seconds;
      setMinutes(0);
      setSeconds(0);
    }
  }, [currentInputString, mistakes, seconds]);

  //{/* TODO: currentInputString.length 에서 mistakes 빼기 */}
  //{Math.round((currentInputString.length / (60 - seconds)) * 60)}
  return (
    <>
      <StyledTypeInput>
        <Paragraph>
          {TEST_STRING.split("").map((letter, index) =>
            letter === "\n" ? (
              <br key={index} />
            ) : (
              <Letter status={generateLetterStatus(currentInputString, letter, index)} key={index}>
                {letter === " " ? <>&nbsp;</> : letter === "-" ? <>&#x2011;</> : letter}
              </Letter>
            )
          )}
        </Paragraph>
        {/* 아래는 테스트용입니다.  */}
        {/* <p> */}
        {/* TODO: currentInputString.length 에서 mistakes 빼기 */}
        {/* {timePassed === 0
            ? Math.round(
                ((currentInputString.length - mistakes) / (60 - totalSecondsSpent.current)) * 60
              )
            : Math.round(((currentInputString.length - mistakes) / timePassed) * 60)}{" "}
          타
        </p>
        <p>{timePassed}</p> */}
      </StyledTypeInput>
    </>
  );
}

export default TypeInput;