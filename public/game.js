document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const secTimeout = 1000;
  const rows = 5;
  const cols = 5;
  const initialHand = {
    1: 5,
    2: 2,
    3: 2,
    4: 1,
    5: 1,
    K: 1,
  };
  let score = 0;
  let bonusPointsAwarded = {
    diagonalTopLeftToBottomRight: false,
    diagonalBottomLeftToTopRight: false,
    rows: Array(rows).fill(false),
    columns: Array(cols).fill(false),
  };
  const hand = document.getElementById("hand");
  const playerHand = {
    symbols: ["1", "2", "3", "4", "5", "K"],
    cards: [], 
    initializeHand: function () {
      this.symbols.forEach((symbol) => {
        for (let i = 0; i < initialHand[symbol]; i++) {
          const card = document.createElement("div");
          card.className = "hand-card";
          card.dataset.symbol = symbol;
          this.cards.push(card);
        }
      });
      this.renderHand();
    },
    renderHand: function () {
      hand.innerHTML = "";
      this.cards.forEach((card) => {
        hand.appendChild(card);
      });
    },
  };

  playerHand.initializeHand();

  let currentHandIndex = 0; // Indeks aktualnie wybranej karty z ręki

  function createBoard() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const card = document.createElement("div");
        card.className = "card hidden";
        card.dataset.row = i;
        card.dataset.col = j;
        board.appendChild(card);
      }
    }
  }

  function shuffleSymbols() {
    const symbolsArray = [];
    symbolsArray.push(...Array(3).fill("5"));
    symbolsArray.push(...Array(5).fill("4"));
    symbolsArray.push(...Array(5).fill("3"));
    symbolsArray.push(...Array(4).fill("2"));
    symbolsArray.push(...Array(7).fill("1"));
    symbolsArray.push("K");
    return symbolsArray.sort(() => Math.random() - 0.5);
  }

  function initGame() {
    createBoard();
    const shuffledSymbols = shuffleSymbols();
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
      card.dataset.symbol = shuffledSymbols[index];
    });
  }

  function handleBoardCardClick(event) {
    const handCardValue = getHandCardValue();
    if (!handCardValue) {
      return;
    }

    const clickedCard = event.target;
    const row = parseInt(clickedCard.dataset.row);
    const col = parseInt(clickedCard.dataset.col);
    const cardValue = clickedCard.dataset.symbol;
    if (!cardValue) {
      return;
    }

    if (!clickedCard.classList.contains("revealed")) {
      clickedCard.classList.add("revealed");
      const adjacentFive = checkForFive(row, col);
      const handValue = parseInt(handCardValue);
      if (handCardValue == "K" || cardValue == "K") {
        if (cardValue == "K" && handCardValue == "K") {
          score += 100;
          updateScoreDisplay();
        } else {
          hideCard(clickedCard, secTimeout);
        }
        removeCardFromHand(handCardValue);
      } else {
        if (handValue == 5 && adjacentFive) {
          removeCardFromHand(handCardValue);
          hideCard(clickedCard, secTimeout);
        } else if (handValue === parseInt(cardValue)) {
          score += cardValue * 10;
          updateScoreDisplay();
          removeCardFromHand(handCardValue);
        } else if (handValue < parseInt(cardValue)) {
          removeCardFromHand(handCardValue);
          hideCard(clickedCard, secTimeout);
        } else if (handValue > parseInt(cardValue)) {
          score += cardValue * 10;
          updateScoreDisplay();
        }
      }

      if (!getHandCardValue()) {
        endGame();
      }
      if (adjacentFive) {
        highlightAdjacentCards(row, col);
        setTimeout(() => {
          removeHighlightAdjacentCards(row, col);
        }, secTimeout);
      }
    }
  }

  function getHandCardValue() {
    const handCards = document.querySelectorAll(".hand-card");
    if (handCards.length > 0 && currentHandIndex < handCards.length) {
      return handCards[currentHandIndex].dataset.symbol;
    }
    return null;
  }

  function removeCardFromHand(cardValue) {
    const handCards = document.querySelectorAll(".hand-card");
    for (let i = 0; i < handCards.length; i++) {
      const card = handCards[i];
      if (card.dataset.symbol === cardValue) {
        card.remove();
        currentHandIndex = Math.min(currentHandIndex, handCards.length - 2); 
        break; 
      }
    }
  }

  function checkForFive(x, y) {
    const neighbors = [
      [x - 1, y - 1],
      [x - 1, y + 1],
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
      [x + 1, y + 1],
      [x + 1, y - 1],
    ];

    // Sprawdź, czy istnieje karta "5" w bezpośrednim sąsiedztwie
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
        const card = document.querySelector(
          `.card[data-row="${nx}"][data-col="${ny}"]`
        );
        if (card.dataset.symbol === "5") {
          return true;
        }
      }
    }
    return false;
  }

  function highlightAdjacentCards(row, col) {
    const neighbors = [
      [row - 1, col - 1],
      [row - 1, col],
      [row - 1, col + 1],
      [row, col - 1],
      [row, col + 1],
      [row + 1, col - 1],
      [row + 1, col],
      [row + 1, col + 1],
    ];

    neighbors.forEach(([x, y]) => {
      if (x >= 0 && x < rows && y >= 0 && y < cols) {
        const card = document.querySelector(
          `.card[data-row="${x}"][data-col="${y}"]`
        );
        card.classList.add("neighbor");
      }
    });
  }

  function removeHighlightAdjacentCards() {
    const highlightedCards = document.querySelectorAll(".neighbor");
    highlightedCards.forEach((card) => {
      card.classList.remove("neighbor");
    });
  }

  function endGame() {
    setTimeout(() => {
      alert("Koniec gry! Twój wynik: " + score);
      revealBoard();
    }, secTimeout);
  }

  function revealBoard() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.classList.add("revealed");
    });
  }
  function updateScoreDisplay() {
    checkAndAwardBonusPoints();
    const scoreDisplay = document.getElementById("score");
    scoreDisplay.textContent = `Score: ${score}`;
  }

  function checkAndAwardBonusPoints() {
    if (
      !bonusPointsAwarded.diagonalTopLeftToBottomRight &&
      checkDiagonalFromTopLeftToBottomRight()
    ) {
      score += 10;
      bonusPointsAwarded.diagonalTopLeftToBottomRight = true;
    }
    if (
      !bonusPointsAwarded.diagonalBottomLeftToTopRight &&
      checkDiagonalFromBottomLeftToTopRight()
    ) {
      score += 10;
      bonusPointsAwarded.diagonalBottomLeftToTopRight = true;
    }
    for (let i = 0; i < rows; i++) {
      if (!bonusPointsAwarded.rows[i] && checkRow(i)) {
        score += 10;
        bonusPointsAwarded.rows[i] = true;
      }
    }
    for (let j = 0; j < cols; j++) {
      if (!bonusPointsAwarded.columns[j] && checkColumn(j)) {
        score += 10;
        bonusPointsAwarded.columns[j] = true;
      }
    }
  }

  function checkDiagonalFromTopLeftToBottomRight() {
    const positions = [0, 6, 12, 18, 24]; // Pozycje do sprawdzenia
    return checkSpecificPositions(positions);
  }

  function checkDiagonalFromBottomLeftToTopRight() {
    const positions = [4, 8, 12, 16, 20]; // Pozycje do sprawdzenia
    return checkSpecificPositions(positions);
  }

  function checkSpecificPositions(positions) {
    let allRevealed = true;
    for (const pos of positions) {
      const card = document.querySelector(
        `.card[data-row="${pos % rows}"][data-col="${Math.floor(
          pos / cols
        )}"].revealed`
      );
      if (!card) {
        allRevealed = false;
        break;
      }
    }
    return allRevealed;
  }

  function checkRow(rowIndex) {
    let allRevealed = true;
    for (let j = 0; j < cols; j++) {
      const card = document.querySelector(
        `.card[data-row="${rowIndex}"][data-col="${j}"]`
      );
      if (!card || !card.classList.contains("revealed")) {
        allRevealed = false;
        break;
      }
    }
    return allRevealed;
  }
  function checkColumn(colIndex) {
    let allRevealed = true;
    for (let i = 0; i < rows; i++) {
      const card = document.querySelector(
        `.card[data-row="${i}"][data-col="${colIndex}"]`
      );
      if (!card || !card.classList.contains("revealed")) {
        allRevealed = false;
        break;
      }
    }
    return allRevealed;
  }

  function hideCard(clickedCard, secTimeout) {
    setTimeout(() => {
      clickedCard.classList.remove("revealed");
    }, secTimeout);
  }
  initGame();
  board.addEventListener("click", handleBoardCardClick);
});
