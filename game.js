let towerGrid = [];
let playerMoney = 100000; // Initial player money
let currentPopulation = 0;
let gameDay = 1;
let selectedBuildingType = null;
const buildingButtons = {};

let yoots = [];
let nextYootId = 0;

const TILE_SIZE = 32;
const gameContainer = document.getElementById('game-container');
let NUM_COLS;
let NUM_ROWS;

const BUILDING_INCOME = {
    "office": 50,
    "fast-food": 30,
};

const BUILDING_MAINTENANCE = {
    "lobby": 5,
    "standard-floor": 5,
    "office": 10,
    "fast-food": 8,
    "elevator": 15
};

const GAME_SETTINGS = {
    economyUpdateInterval: 5000 // milliseconds (e.g., every 5 seconds)
};
let lastEconomyUpdateTime = 0;

const buildingColors = {
    "lobby": '#FFFF99',
    "standard-floor": '#ADD8E6',
    "office": '#90EE90',
    "fast-food": '#FFB6C1',
    "elevator": '#808080'
};

function initializeGridDimensions() {
  if (!gameContainer) {
    console.error("game-container not found!");
    return;
  }
  NUM_COLS = Math.floor(gameContainer.clientWidth / TILE_SIZE);
  NUM_ROWS = Math.floor(gameContainer.clientHeight / TILE_SIZE);
  towerGrid = [];
  for (let r = 0; r < NUM_ROWS; r++) {
    towerGrid[r] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      towerGrid[r][c] = null;
    }
  }
}

function updateUIDisplay() {
    const moneyDisplay = document.getElementById('player-money-display');
    if (moneyDisplay) {
        moneyDisplay.textContent = playerMoney;
    }
}

function updateBuildButtonUI() {
    for (const type in buildingButtons) {
        if (buildingButtons[type]) {
            buildingButtons[type].classList.remove('selected');
        }
    }
    if (selectedBuildingType && buildingButtons[selectedBuildingType]) {
        buildingButtons[selectedBuildingType].classList.add('selected');
    }
}

function initializeBuildMenu() {
    const buttonIds = {
        "lobby": "build-lobby",
        "standard-floor": "build-standard-floor",
        "office": "build-office",
        "fast-food": "build-fast-food",
        "elevator": "build-elevator"
    };
    for (const type in buttonIds) {
        const buttonElement = document.getElementById(buttonIds[type]);
        if (buttonElement) {
            buildingButtons[type] = buttonElement;
            buttonElement.addEventListener('click', () => {
                selectedBuildingType = (selectedBuildingType === type) ? null : type;
                updateBuildButtonUI();
                console.log("Selected building: ", selectedBuildingType);
            });
        } else {
            console.warn(`Button with ID ${buttonIds[type]} not found.`);
        }
    }
    updateBuildButtonUI(); // Initial call to ensure no buttons are selected at start
    updateUIDisplay();
}

function handleTileClick(row, col) {
    if (selectedBuildingType !== null) {
        if (towerGrid[row][col] === null) {
            towerGrid[row][col] = selectedBuildingType;
        } else {
            console.log(`Cannot build on tile [${row}, ${col}]. It's already occupied by ${towerGrid[row][col]}.`);
        }
    } else {
        console.log("No building type selected. Click a button from the build menu first.");
    }
}

function spawnYoot() {
    let lobbyRow = -1;
    let lobbyCol = -1;
    for (let r = 0; r < NUM_ROWS; r++) {
        for (let c = 0; c < NUM_COLS; c++) {
            if (towerGrid[r][c] === "lobby") {
                lobbyRow = r;
                lobbyCol = c;
                break;
            }
        }
        if (lobbyRow !== -1) break;
    }

    if (lobbyRow !== -1 && lobbyCol !== -1) {
        const newYoot = {
            id: nextYootId++, currentFloor: lobbyRow, currentRow: lobbyRow, currentCol: lobbyCol,
            destinationFloor: null, destinationRow: null, destinationCol: null, state: 'arriving'
        };
        yoots.push(newYoot);
        currentPopulation++;
        console.log(`Spawned Yoot ${newYoot.id} at lobby [${newYoot.currentRow}][${newYoot.currentCol}]`);
    } else {
        console.log("Cannot spawn Yoot: No lobby found.");
    }
}

function renderTower() {
  if (!gameContainer || typeof NUM_COLS === 'undefined' || typeof NUM_ROWS === 'undefined') {
    return;
  }
  gameContainer.innerHTML = '';
  gameContainer.style.display = 'grid';
  gameContainer.style.gridTemplateColumns = `repeat(${NUM_COLS}, ${TILE_SIZE}px)`;
  gameContainer.style.gridTemplateRows = `repeat(${NUM_ROWS}, ${TILE_SIZE}px)`;

  for (let r = 0; r < NUM_ROWS; r++) {
    for (let c = 0; c < NUM_COLS; c++) {
      const tileDiv = document.createElement('div');
      tileDiv.style.width = TILE_SIZE + 'px';
      tileDiv.style.height = TILE_SIZE + 'px';
      tileDiv.style.border = '1px solid #ccc';
      tileDiv.style.boxSizing = 'border-box';
      tileDiv.style.display = 'flex';
      tileDiv.style.alignItems = 'center';
      tileDiv.style.justifyContent = 'center';
      tileDiv.style.fontSize = `${TILE_SIZE / 3}px`;
      tileDiv.style.overflow = 'hidden';
      tileDiv.style.color = '#333333';

      const buildingType = towerGrid[r][c];
      let tileText = "";

      if (buildingType) {
        tileDiv.style.backgroundColor = buildingColors[buildingType] || '#cccccc';
        if (buildingType === "elevator") {
            tileText = "Elv";
        } else {
            tileText = buildingType.charAt(0).toUpperCase() + buildingType.slice(1,3);
        }
      } else {
        tileDiv.style.backgroundColor = '#f0f0f0';
      }
      tileDiv.textContent = tileText;

      let occupants = yoots.filter(yoot => yoot.currentRow === r && yoot.currentCol === c);
      if (occupants.length > 0) {
          tileDiv.textContent += ` (${occupants.length}Y)`;
      }

      tileDiv.addEventListener('click', () => handleTileClick(r, c));
      gameContainer.appendChild(tileDiv);
    }
  }
}

function updateEconomy(currentTime) {
    if (currentTime - lastEconomyUpdateTime < GAME_SETTINGS.economyUpdateInterval) {
        return;
    }
    lastEconomyUpdateTime = currentTime;

    let currentCycleIncome = 0;
    let currentCycleExpenses = 0;

    for (let r = 0; r < NUM_ROWS; r++) {
        for (let c = 0; c < NUM_COLS; c++) {
            const buildingType = towerGrid[r][c];
            if (buildingType) {
                if (BUILDING_INCOME[buildingType]) {
                    currentCycleIncome += BUILDING_INCOME[buildingType];
                }
                if (BUILDING_MAINTENANCE[buildingType]) {
                    currentCycleExpenses += BUILDING_MAINTENANCE[buildingType];
                }
            }
        }
    }

    playerMoney += currentCycleIncome - currentCycleExpenses;
    console.log(`Economy Update: Income: ${currentCycleIncome}, Expenses: ${currentCycleExpenses}, Net: ${currentCycleIncome - currentCycleExpenses}, New Balance: ${playerMoney}`);
    updateUIDisplay();
}


function updateGame(currentTime) {
    // console.log(`Updating game state - Yoots count: ${yoots.length}`);
    // for (const yoot of yoots) {
    //    console.log(`Yoot ID: ${yoot.id}, State: ${yoot.state}, Location: F${yoot.currentFloor}[${yoot.currentRow}][${yoot.currentCol}]`);
    // }
    updateEconomy(currentTime);
}

function gameLoop(timestamp) {
  updateGame(timestamp);
  renderTower();
  requestAnimationFrame(gameLoop);
}

window.onload = () => {
  initializeGridDimensions();
  initializeBuildMenu();
  setTimeout(() => {
      spawnYoot();
  }, 2000);
  lastEconomyUpdateTime = performance.now();
  gameLoop(performance.now());
};
