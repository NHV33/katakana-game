function newElement(tag, attrs, parent) {
  const newElem = document.createElement(tag);
  parent = parent ? parent : document.body;
  parent.append(newElem);
  for (const key in attrs) {
    newElem.setAttribute(key, attrs[key])
  }
  return newElem
}

function toggleVisibleById(elementId, setVisible=null) {
  const e = document.getElementById(elementId);
  if (setVisible === null) {
    e.style.visibility = e.style.visibility === "hidden" ? null : "hidden";
  } else {
    e.style.visibility = setVisible === true ? null : "hidden";
  }

  // if (e.style.visibility === "hidden") {
  //   e.style.visibility = null;
  // } else {
  //   e.style.visibility = "hidden";
  // }
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const randItem = (list) => list[randInt(0, list.length)];
const removeItem = (arr, value) => arr.filter(item => item !== value);

// function copyToClipboard() {
//   inputField.value = inputField.value.replace(cursorChar, "");
//   inputField.select();
//   try {
//     document.execCommand('copy');
//     keyTest.textContent = 'Copied text!';
//     inputInterceptor.focus();
//   } catch (err) {
//     keyTest.textContent = 'Unable to copy text';
//     console.error('Unable to copy text', err);
//   }
// }

function fetchJSON(url, updateFunction) {
  fetch(url)
    .then(function (promise) {
      return promise.json();
    })
    .then(function (data) {
      updateFunction(data);
    })
    .catch(function (error) {
      console.error('Error:', error);
    });
}

let words;
let availableWords;

fetchJSON("words.json", (data) => {
  words = data;
  availableWords = data;
  console.log(words);
});

function updateCount(state, display, increment=0, onChangeFunc) {
  const newCount = gs[state] + increment;
  if (newCount < 0 || newCount > 8888) {
    return
  }
  gs[state] = newCount;
  display.textContent = gs[state];
  if (onChangeFunc) {
    onChangeFunc();
  }
}

function newCountRow(parent, stateName, onChangeFunc=null) {

  const countRow = newElement("div", {style: "margin-top: 5px;"}, parent);

  const label = newElement("span", {style: "margin: 5px"}, countRow)
  label.textContent = stateName;

  const decButton = newElement("button", {}, countRow);
  decButton.textContent = "ー";
  decButton.addEventListener("click", () => {
    updateCount(stateName, countDisplay, -1, onChangeFunc)
  });

  const countDisplay = newElement("span", {style: "margin: 20px;"}, countRow)
  updateCount(stateName, countDisplay, 0, onChangeFunc);

  if (!gs[stateName]) {
    gs[stateName] = 0;
    countDisplay.textContent = 0;
  }

  const incButton = newElement("button", {}, countRow);
  incButton.textContent = "＋";
  incButton.addEventListener("click", () => {
    updateCount(stateName, countDisplay, 1, onChangeFunc)
  });

  return countRow
}

function selectNewWord() {
  if (availableWords.length > 0) {
    const choice = randItem(availableWords);
    availableWords = removeItem(availableWords, choice);
    // return `(${availableWords.length}) ${choice}`;
    return choice;
  }
  return "おしまい"
}

// "gs" == "Game State"
let gs = {
  timer: null,
  Players: 2,
}

/** Element Creation */

// const testModal = newElement("dialog");
// testModal.showModal();

const mainBox = newElement("div", {style: "width: 90vmin; margin: auto; display: flex; flex-direction: column; flex-wrap: nowrap; align-items: center;"})

renderTutorial();

function renderTutorial() {
  const tutBox = newElement("div", {style: "overflow-y: scroll; width: 90%; min-height: 60vh; border: 2px solid black; padding: 10px;"}, mainBox);
  const startButtonBox = newElement("div", {}, mainBox);
  const tutTitle = newElement("h3", {style: "width: 100%; text-align: center; margin: 5px;"}, tutBox);
  const tutText = newElement("span", {style: "font-size: 8px; margin: 5px;"}, tutBox);
  tutTitle.textContent = "カタこと";
  tutText.innerHTML = "\
  <b>目的</b>：カタカナで表記されるような単語（外来語・オノマトペなど）を<b>一切使わずに</b>表示される単語を説明すること。\
  <br><b>規則</b>：時間内に誰にも正解を当ててもらえなかった場合、単語を説明する人には２ポイント減点されます。\
  <br>正解を当ててもらえた場合、正解を早く言えた人と説明した人にも１ポイント加点されます。";

  const startButton = newElement("button", {id: "start-button", style: "font-size: 20px; margin: 5px;"}, startButtonBox);
  startButton.textContent = "開始";
  startButton.addEventListener("click", () => {
    mainBox.textContent = "";
    renderGameUI();
  })


  newCountRow(tutBox, "Players", () => {
    toggleVisibleById("start-button", setVisible=(gs["Players"] > 0));
  });
}

function renderGameUI() {

  const timeLimit = 90;
  let testTimer = null;

  const playerCountToggleBox = newElement("div", {}, mainBox)
  const wordAndTimeBox = newElement("div", {style: "margin: 5px; border: 1px solid black; min-width: 100%; display: flex; justify-content: center; align-items: center; flex-wrap: nowrap;"}, mainBox)
  const wordDisplay = newElement("div", {style: "width: 70%; display: flex; justify-content: center; align-items: center; flex-wrap: nowrap; min-height: 40px; font-size: 20px;"}, wordAndTimeBox);
  const timeDisplay = newElement("div", {style: "width: 30%; display: flex; justify-content: center; align-items: center; flex-wrap: nowrap; min-height: 40px; font-size: 20px; background-color: lightgrey;"}, wordAndTimeBox);
  const nextButton = newElement("button", {style: "font-size: 15px;"}, mainBox);
  nextButton.textContent = "次の問題を表示";
  nextButton.addEventListener("click", () => {
    wordDisplay.textContent = selectNewWord();
    wordDisplay.style.color = null;
    testTimer = timeLimit;
    updateTimer();
  });

  const playerScoreBox = newElement("div", {style: "margin: 5px; padding: 5px; border: 1px solid black; display: flex; flex-direction: column; flex-wrap: nowrap;"}, mainBox)

  newCountRow(playerCountToggleBox, "Players", () => {
    playerScoreBox.textContent = "";
    for (let i = 1; i <= gs["Players"]; i++) {
      newCountRow(playerScoreBox, `P${i}`);
    }
  });

  function updateTimer() {
    if (!testTimer) { return }
    if (testTimer > 0) {
      timeDisplay.textContent = `${testTimer}秒`;
      testTimer -= 1;
    } else {
      timeDisplay.textContent = `終了`;
      wordDisplay.style.color = "lightgrey";
    }
  }

  setInterval(() => {
    updateTimer();
  }, 1000)
}
