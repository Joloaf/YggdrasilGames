

// This is the main game script for our little game! It runs the show together with the HTML and CSS files as well as our extra textframe script.
// It handles most most of the game logic, including player movement, cat and zombie spawning, and the game over screen.
// This is yet an early version of the game, so expect some bugs and missing features!
// The game is a work in progress, so please be patient as there are still many more features to be added and bugs to be fixed!


// Many variables... and surely many more to come!
window.gridImageMap = {}; // This global helps us send the correct image to cell to the textframe script so that we can give it the correct text description.
const gridSize = 10;  // The size of our little forest. Surely this will be expanded in the future. Possibly letting the player/difficulty determine the size of the grid.
let gameActive = true;
let player = { x: 0, y: 0 };
let cats = [];
let zombies = [];
let score = 0;
let moveCount = 0;
let level = 1;
let rescuedThisLevel = 0;
let catsThisLevel = 1;
let zombiesVisible = false;
let zombieFadeTimeout = null;
let fadingZombies = new Set();
let visibilityRadius = 2;
let flashlight = null;
let flashlightSteps = 0;
let flashlightJustPickedUp = false;


// Getting some UI elements ready to go...
const grid = document.getElementById('grid');
const flashlightDuration = 10;
const batteryDisplay = document.querySelector('#battery strong');
const scoreDisplay = document.querySelector('#score strong');

// Getting the music and ambient sound elements ready to go...
const musicBtn = document.getElementById('toggle-music');
const bgMusic = document.getElementById('bg-music');
const ambientBtn = document.getElementById('toggle-ambient');
const ambient = document.getElementById('ambient-sound');

// Getting the sound effects ready to go...
let soundEffectsEnabled = true;
const toggleSfxBtn = document.getElementById('toggle-sfx');
const zombieAttack = document.getElementById('zombie-attack');
const forestWalk = document.getElementById('forest-walk');
const catHappy = document.getElementById('cat-happy');


// Function to shuffle an array... this is used to randomize the images for the rooms in the grid.
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


// Function to assign random images to the cells in the grid...
// This way, we can have a different image for each cell in the grid... yet randomly assigned each time the game starts thanks to the shuffleAttay function! Super swell, I know! :)
function assignRoomImages() {
  const allFilenames = Array.from({ length: 100 }, (_, i) => `${i + 1}.jpg`);
  shuffleArray(allFilenames);

  window.gridImageMap = {};
  let index = 0;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const key = `${x},${y}`;
      gridImageMap[key] = allFilenames[index++];
    }
  }
}


// Function to check if two positions are equal... this is used in a lot of places, so it got to be its own function!
function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}


// Function to get a random position on the grid, excluding certain positions... this is used for spawning the player, cats, zombies, and the flashlight...
function getRandomPosition(exclude = []) {
  let pos;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    attempts++;
    if (attempts > 100) break;
  } while (exclude.some(p => positionsEqual(p, pos)));
  return pos;
}


// Function to start the game... 
function startGame() {
  gameActive = true;
  batteryDisplay.textContent = '0/' + flashlightDuration;
  const existingOverlay = document.getElementById('gameOverOverlay');
  if (existingOverlay) existingOverlay.remove();
  gameOverScreen.style.display = 'none';

  score = 0;
  moveCount = 0;
  level = 1;
  rescuedThisLevel = 0;
  catsThisLevel = 1;
  cats = [];
  zombies = [];
  player = getRandomPosition();
  
  visibilityRadius = 2;
  flashlight = null;
  flashlightSteps = 0;

  spawnCats();
  spawnZombies();
  spawnFlashlight();
  assignRoomImages();

  scoreDisplay.textContent = score;
  drawGrid();
  updateRoomDisplay();
  initializeStoryBox();
}


// Function to spawn cats based on the level... levels are determined by the score. Convoluted, I know... Hope to update this in the future!
function spawnCats() {
  cats = [];
  for (let i = 0; i < catsThisLevel; i++) {
    const catPosition = getRandomPosition([player, ...cats, ...zombies]);
    cats.push(catPosition);
    if (i === 0) {
      window.catX = catPosition.x;
      window.catY = catPosition.y;
      // This is just for debugging purposes, to see where the cat spawns...
      console.log(`Cat spawned at (${window.catX}, ${window.catY})`);
    }
  }
}


// Function to spawn zombies based on the score...
function spawnZombies() {
  const zombieTargetCount = Math.floor(score / 5) + 1;
  while (zombies.length < zombieTargetCount) {
    const newZombie = getRandomPosition([player, ...cats, ...zombies]);
    if (!zombies.some(z => positionsEqual(z, newZombie))) {
      zombies.push(newZombie);
    }
  }
}


// Function to spawn a flashlight at a random position on the grid...
function spawnFlashlight() {
  flashlight = getRandomPosition([player, ...cats, ...zombies]);
}


// Function to handle the zombie alert logic...
function getZombieAlert() {
  let closestZombie = null;
  let minDistance = Infinity;

  zombies.forEach(zombie => {
    const dx = zombie.x - player.x;
    const dy = zombie.y - player.y;
    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    window.zombieX = zombie.x;
    window.zombieY = zombie.y;

    if (distance < minDistance) {
      minDistance = distance;
      closestZombie = { dx, dy, distance, x: zombie.x, y: zombie.y };
    }
  });

  if (closestZombie && minDistance <= 4) {
    const direction = getDirectionFromDelta(closestZombie.dx, closestZombie.dy);
    const distanceText = minDistance <= 2 ? 'very close' : `${minDistance} tiles away`;

    sendZombieAlertToTextFrame({
      type: 'zombie',
      message: `You sense danger ${distanceText} to the ${direction}.`,
      direction,
      distance: closestZombie.distance,
      zombiePosition: { x: closestZombie.x, y: closestZombie.y }
    });
  } else {
    sendZombieAlertToTextFrame({
      type: 'zombie',
      message: 'The area seems quiet... for now.',
      direction: null,
      distance: null,
      zombiePosition: null
    });
  }
}


// Function to handle the cat alert logic...
function getCatAlert() {
  let closestCat = null;
  let minDistance = Infinity;

  cats.forEach(cat => {
    const dx = cat.x - player.x;
    const dy = cat.y - player.y;
    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    if (distance < minDistance) {
      minDistance = distance;
      closestCat = { dx, dy, distance, x: cat.x, y: cat.y };
    }
  });

  let message = 'No sign of any cat.';
  let direction = null;
  let distance = null;

  if (closestCat && closestCat.distance === 0) {
    message = "You've found a cat! 🐈 Press a direction key to move and rescue it.";
    direction = 'here';
    distance = 0;
  } else if (closestCat && closestCat.distance <= 3) {
    direction = getDirectionFromDelta(closestCat.dx, closestCat.dy);
    distance = closestCat.distance;
    const closeText = closestCat.distance === 1 ? 'nearby' : `${closestCat.distance} tiles away`;
    message = `You hear a faint meow ${closeText} to the ${direction}.`;
  }

  if (typeof updateTextFrame === 'function') {
    updateTextFrame({
      type: 'cat',
      message,
      direction,
      distance,
      catPosition: closestCat ? { x: closestCat.x, y: closestCat.y } : null
    });
  }
}


// Function to get the direction from the delta values...
function getDirectionFromDelta(dx, dy) {
  const horizontal = dx > 0 ? 'east' : dx < 0 ? 'west' : '';
  const vertical = dy > 0 ? 'south' : dy < 0 ? 'north' : '';

  if (horizontal && vertical) return `${vertical}-${horizontal}`;
  return vertical || horizontal || 'here';
}


// Function to send zombie alert to the text frame... Started using this function but will probably include this in the getZombieAlert function in a later version.
function sendZombieAlertToTextFrame(alertObj) {
  if (typeof updateTextFrame === 'function') {
    updateTextFrame(alertObj);
  } else {
    console.warn("updateTextFrame function is not defined!");
  }
}


// Function to move the player and handle game logic... 
// This function is a bit long and will be restructured in the future for better readability and maintainability...
function movePlayer(dx, dy) {
  if (!gameActive) return;
  
  const newX = player.x + dx;
  const newY = player.y + dy;

  // Check for collision BEFORE moving the player... Added this to prevent some game lag when moving the player and the zombies at the same time.
  // Hope to combine this with the zombie logic a bit further down in this function in the future, and let it be its own function...
  if (zombies.some(z => positionsEqual({x: newX, y: newY}, z))) {
    gameActive = false;
    setTimeout(() => {
    showZombieEncounter();
    }, 150);
    return;
  }

  if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return;

  player.x = newX;
  player.y = newY;
  moveCount++;

  if (soundEffectsEnabled) {
    forestWalk.play();
  }

  // Updates the text frame with the information for the current location they're in...
  if (typeof updateStoryBox === 'function') {
    console.log("Calling updateStoryBox with:", player.x, player.y);
    updateStoryBox(player.x, player.y, gridImageMap);
  } else {
    console.warn("updateStoryBox is not defined or not a function!");
  }

  getZombieAlert();
  getCatAlert();
  drawGrid();
  updateRoomDisplay();

  // Handle flashlight logic... Will be restructured in the future to be its own function handling the flashlight logic....
  if (flashlight && positionsEqual(player, flashlight)) {
    if (flashlightSteps === 0) {
      visibilityRadius++;
    }
    flashlightSteps = flashlightDuration;
    batteryDisplay.textContent = flashlightSteps + '/' + flashlightDuration;
    flashlight = null;
    flashlightJustPickedUp = true;
  }

  if (flashlightSteps > 0) {
    if (flashlightJustPickedUp) {
      flashlightJustPickedUp = false;
    } else {
      flashlightSteps--;
    }

    batteryDisplay.textContent = flashlightSteps + '/' + flashlightDuration;

    if (flashlightSteps === 0) {
      visibilityRadius--;
      spawnFlashlight();
    }
  } else {
    batteryDisplay.textContent = '0/' + flashlightDuration;
  }

  // Handle cat logic... This will also be restructured in the future to be its own function handling the cat logic....
  let caughtCat = false;
  cats = cats.filter(cat => {
    if (positionsEqual(player, cat)) {
      score++;
      rescuedThisLevel++;
      showCatEncounter();
      caughtCat = true;
      return false;
    }
    return true;
  });

  if (rescuedThisLevel >= catsThisLevel) {
    level++;
    rescuedThisLevel = 0;
    catsThisLevel = Math.floor(score / 10) + 1;
    spawnCats();
  }

  // Handle zombie logic... This will also be restructured in the future to be its own function handling the zombie logic....
  spawnZombies();
  scoreDisplay.textContent = score;

  if (moveCount % 2 === 0) {
    let zombieCollisionOccurred = false;
    moveZombies();

    zombies.forEach(z => {
      if (positionsEqual(player, z)) {
        zombieCollisionOccurred = true;
      }
    });

    if (zombieCollisionOccurred) {
      gameActive = false;
      setTimeout(() => {
        showZombieEncounter();
      }, 150);
      return;
    }
  }

  drawGrid();
  updateRoomDisplay();
}



// Function to move zombies towards the player and handle fading effect...
// Future updates will include a more efficient way to handle the fading effect and possibly a more complex zombie movement logic.
// Right now, zombies might get stuck on cats and even attack you as you rescue a cat... lucily, this doesn't happen too often... but it will be fixed in the future! :)
function moveZombies() {
  let occupied = [...cats];
  if (flashlight) occupied.push(flashlight);
  let newZombies = [];
  fadingZombies.clear();

  for (const zombie of zombies) {
    const dx = player.x - zombie.x;
    const dy = player.y - zombie.y;

    let newPos = { ...zombie };
    if (Math.abs(dx) > Math.abs(dy)) {
      newPos.x += Math.sign(dx);
    } else if (dy !== 0) {
      newPos.y += Math.sign(dy);
    }

    window.zombieX = zombie.x;
    window.zombieY = zombie.y;
  
    if (
      !occupied.some(p => positionsEqual(p, newPos)) &&
      !newZombies.some(z => positionsEqual(z, newPos))
    ) {
      newZombies.push(newPos);
      occupied.push(newPos);
    } else {
      newZombies.push(zombie);
      occupied.push(zombie);
    }
    fadingZombies.add(`${newPos.x},${newPos.y}`);
  }

  zombies = newZombies;
  zombiesVisible = true;
  drawGrid();

  if (zombieFadeTimeout) clearTimeout(zombieFadeTimeout);
  zombieFadeTimeout = setTimeout(() => {
    zombiesVisible = false;
    fadingZombies.clear();
    drawGrid();
  }, 1000);
}


// Throws a zombie into the player's face! Sorry, not sorry. Enjoy! ;)
function showZombieEncounter() {
  const zombieDiv = document.getElementById("zombie-encounter");
  const zombieImg = document.getElementById("zombie-image");
  const leaderboard = document.getElementById("leaderboard");

  if (soundEffectsEnabled) {
    zombieAttack.play();
  }
  
  const zombieNum = Math.floor(Math.random() * 4) + 1;
  zombieImg.src = `../assets/images/zombie${zombieNum}.png`;
  zombieDiv.classList.remove("hidden");
  zombieImg.style.opacity = 1;
  
  setTimeout(() => {
    zombieImg.style.transition = "opacity 1s ease-out";
    zombieImg.style.opacity = 0;
  
    // Wait for the fade-out to complete before hiding the zombie div and showing the leaderboard
    setTimeout(() => {
      zombieDiv.classList.add("hidden");
      if (leaderboard) {
        leaderboard.style.display = 'block';
      }
    }, 1000);
    setTimeout(() => {
      showGameOverScreen(score);
    }, 1500);
  }, 3000);
}


function showCatEncounter() {
  const catDiv = document.getElementById("cat-encounter");
  const catImg = document.getElementById("cat-image");

  if (soundEffectsEnabled) {
    catHappy.play();
  }

  catImg.src = `../assets/images/cat.png`;
  catDiv.classList.remove("hidden");
  catImg.style.opacity = 0;
  catImg.style.transition = "opacity 0.2s ease-in";

  // Dealing with the cat fading effect...
  setTimeout(() => {
    catImg.style.opacity = 1;
  }, 10);
  setTimeout(() => {
    catImg.style.transition = "opacity 3s ease-out";
    catImg.style.opacity = 0;
  }, 2000);
  setTimeout(() => {
    catDiv.classList.add("hidden");
  }, 2000);
}


// Function to draw/update the grid...
// Still awaiting some restructuring to make this more efficient and readable.
// Right now I made this function handle a bit too much...
// The zombie fading effect is a bit broken, but it kinda works as intended... for now.
function drawGrid() {
  grid.innerHTML = '';
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
  
      const dx = player.x - x;
      const dy = player.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const inSight = distance <= visibilityRadius;
  
      if (!inSight) cell.classList.add('foggy');
  
      if (player.x === x && player.y === y) {
        cell.textContent = '🕵️';
      } else if (cats.some(cat => cat.x === x && cat.y === y)) {
        cell.textContent = '🐈';
      } else if (flashlight && flashlight.x === x && flashlight.y === y) {
        cell.textContent = '🔦';
      } else {
        const isZombieHere = zombies.some(z => z.x === x && z.y === y);
  
        let isVisibleZombie = false;

        const dxAbs = Math.abs(player.x - x);
        const dyAbs = Math.abs(player.y - y);

        if (flashlightSteps > 0) {
        const isDiagonal = dxAbs === 1 && dyAbs === 1;
        const isCardinal = (dxAbs === 0 && dyAbs <= 2) || (dyAbs === 0 && dxAbs <= 2);
        isVisibleZombie = isDiagonal || isCardinal;
        } else {
        isVisibleZombie = (dxAbs + dyAbs === 1);
        }
  
        if (isZombieHere && isVisibleZombie) {
          cell.textContent = '💀';
        } else if (
          isZombieHere &&
          zombiesVisible &&
          fadingZombies.has(`${x},${y}`) &&
          !isVisibleZombie
        ) {
          const zombieEmoji = document.createElement('span');
          zombieEmoji.textContent = '💀';
          zombieEmoji.classList.add('fade-zombie');
          cell.appendChild(zombieEmoji);
        }
      }
      grid.appendChild(cell);
    }
  }
}
  
  
// Function to update the room display with the current image...
function updateRoomDisplay() {
  const key = `${player.x},${player.y}`;
  const imageFile = gridImageMap[key];
  const room = document.getElementById('room');
  
  if (imageFile) {
    const newImage = document.createElement('div');
    newImage.classList.add('room-image');
    newImage.style.backgroundImage = `url('../assets/images/${imageFile}')`;
    newImage.style.opacity = 0;
    room.appendChild(newImage);
    
    setTimeout(() => {
      newImage.style.transition = 'opacity 0.6s ease-in-out';
      newImage.style.opacity = 1;
    }, 300);

    setTimeout(() => {
      const currentImages = room.querySelectorAll('.room-image');
      if (currentImages.length > 1) {
        room.removeChild(currentImages[0]);
      }
    }, 1300);
  }
}


// Event listeners for keyboard controls... this will be structured differently in a later version, keeping all the navigation in one place.
document.addEventListener('keydown', (e) => {
  if (!gameActive || document.activeElement.tagName === 'INPUT') return;
  const key = e.key.toLowerCase();
  if (key === 'n') movePlayer(0, -1);
  else if (key === 's') movePlayer(0, 1);
  else if (key === 'e') movePlayer(1, 0);
  else if (key === 'w') movePlayer(-1, 0);
});


// Getting the necessary Firebase code so that we can show the highscores...
async function getTopScores() {
  const { collection, getDocs, query, orderBy, limit } = window.firebaseModules;
  const db = window.firebaseDB;

  const scoresRef = collection(db, 'scores');
  const q = query(scoresRef, orderBy('score', 'desc'), limit(10));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


// Getting the necessary Firebase code so that we can save to the highscores...
async function submitScore(name, score) {
  const { collection, addDoc } = window.firebaseModules;
  const db = window.firebaseDB;

  return await addDoc(collection(db, 'scores'), { name, score });
}


// Function to show the game over screen and handle score submission...
async function showGameOverScreen(score) {
  const leaderboard = await getTopScores();
  const lowestScore = leaderboard.length === 10 ? leaderboard[9].score : 0;
  const isTopTen = score > lowestScore || leaderboard.length < 10;

  const container = document.getElementById('room');
  const images = container.querySelectorAll('.room-image');
  images.forEach((img, i) => {
  if (i < images.length - 1) img.remove();
  });

  const overlay = document.createElement('div');
  overlay.id = 'gameOverOverlay';
  overlay.className = 'game-over-overlay';

  const title = document.createElement('h2');
  title.textContent = `Game Over – You rescued ${score} cat${score !== 1 ? 's' : ''}!`;
  overlay.appendChild(title);

  const list = document.createElement('ol');
  list.style.textAlign = 'left';
  list.style.maxWidth = '400px';
  list.style.margin = '1rem auto';

  container.appendChild(overlay);
  overlay.appendChild(list);

  let input;
  let insertIndex = leaderboard.findIndex(entry => score > entry.score);
  if (insertIndex === -1 && leaderboard.length < 10) {
    insertIndex = leaderboard.length;
  }

  const updatedEntries = [...leaderboard];
  if (isTopTen) {
    updatedEntries.splice(insertIndex, 0, { name: '', score });
    if (updatedEntries.length > 10) updatedEntries.pop();
  }

  updatedEntries.forEach((entry, i) => {
    const item = document.createElement('li');
    if (entry.name === '' && entry.score === score) {
      input = document.createElement('input');
      input.placeholder = 'Enter your name and press Enter';
      input.maxLength = 20;
      input.style.width = '80%';
      item.appendChild(input);
    } else {
      item.textContent = `${entry.name}: ${entry.score}`;
    }
    list.appendChild(item);
  });

  if (input) {
    // If the player placed in the top 10...
    input.focus();
    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const name = input.value.trim();
        await submitScore(name, score);

        const freshBoard = await getTopScores();
        list.innerHTML = '';
        freshBoard.forEach(entry => {
          const item = document.createElement('li');
          item.textContent = `${entry.name}: ${entry.score}`;
          list.appendChild(item);
        });

        const restart = document.createElement('button');
        restart.textContent = 'Play Again';
        restart.style.marginTop = '1rem';
        restart.onclick = startGame;
        overlay.appendChild(restart);
      }
    });
  } else {
    // ...or if the player didn't place in top 10...
    const restart = document.createElement('button');
    restart.textContent = 'Play Again';
    restart.style.marginTop = '1rem';
    restart.onclick = startGame;
    overlay.appendChild(restart);
  }
}

// Waiting for the user to click before playing background music and ambient sound. Some browsers require user interaction to play audio.
window.addEventListener('click', () => {
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic.paused) {
    bgMusic.play();
  }
  const ambient = document.getElementById('ambient-sound');
  if (ambient.paused) {
    ambient.play();
  }
}, { once: true });1

// Toggle background music on and off
musicBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.textContent = '🎵';
  } else {
    bgMusic.pause();
    musicBtn.textContent = '🔇';
  }
});

// Toggle ambient sound on and off
ambientBtn.addEventListener('click', () => {
  if (ambient.paused) {
    ambient.play();
    ambientBtn.textContent = '🌲';
  } else {
    ambient.pause();
    ambientBtn.textContent = '🔕';
  }
});

// Toggle sound effects on and off
toggleSfxBtn.addEventListener('click', () => {
  soundEffectsEnabled = !soundEffectsEnabled;
  toggleSfxBtn.textContent = soundEffectsEnabled ? '🦖' : '🐁';
});

startGame();