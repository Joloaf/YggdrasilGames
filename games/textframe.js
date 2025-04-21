

// This is the text frame script for the game...
// Most of the text output is handled here...
// The game logic for most of the game is in the zombiecatscript.js file...

const storyBox = document.getElementById('storyBox');
const storyText = document.getElementById('storyText');
const zombieAlertBox = document.getElementById('zombieAlertBox');


// Adding a specific message to describe each of the images in the grid...
// Most of these are generic and might not always fit to the image, but they'll be adjusted over time with future updates...
const imageDescriptions = {
    "1.jpg": "The trees loom like towering shadows, their branches twisted under the moonlight.",
    "2.jpg": "A mysterious cave entrance stands before you.",
    "3.jpg": "A small village appears in the distance.",
    "4.jpg": "A dark, abandoned castle looms overhead.",
    "5.jpg": "A tranquil lake reflects the moonlight.",
    "6.jpg": "A winding path leads deeper into the woods.",
    "7.jpg": "A clearing reveals a strange stone altar.",
    "8.jpg": "A strange symbol is etched into a rock.",
    "9.jpg": "A field of wildflowers sways gently in the breeze.",  
    "10.jpg": "A towering mountain range blocks the horizon.",
    "11.jpg": "A dense fog rolls in, obscuring your view.",
    "12.jpg": "A rusted signpost points in multiple directions.",
    "13.jpg": "A weathered tree stands alone in the clearing.",
    "14.jpg": "A narrow stream babbles nearby.",
    "15.jpg": "A flock of birds takes flight overhead.",
    "16.jpg": "A distant howl echoes through the night.",
    "17.jpg": "A flickering lantern hangs from a branch.",
    "18.jpg": "A pile of rocks hides something shiny.",
    "19.jpg": "A small campfire crackles softly.",
    "20.jpg": "A pair of glowing eyes watch you from the shadows.",
    "21.jpg": "A mysterious figure stands at the edge of the forest.",
    "22.jpg": "A weathered map lies on the ground.",
    "23.jpg": "A strange symbol is carved into a tree.",
    "24.jpg": "A gentle breeze carries the scent of flowers.",
    "25.jpg": "A distant thunderstorm rumbles ominously.",
    "26.jpg": "A hidden path leads off the main trail.",
    "27.jpg": "A large boulder blocks the way.",
    "28.jpg": "A small animal scurries away.",
    "29.jpg": "A patch of mushrooms grows in the shade.",
    "30.jpg": "A colorful butterfly flits by.",
    "31.jpg": "A rustling sound comes from the bushes.",
    "32.jpg": "A faint light glimmers in the distance.",
    "33.jpg": "A strange noise echoes through the trees.",
    "34.jpg": "A pile of leaves hides something beneath.",
    "35.jpg": "A distant waterfall can be heard.",
    "36.jpg": "A small bridge crosses a stream.",
    "37.jpg": "A stone statue stands in the clearing.",
    "38.jpg": "A path leads up a steep hill.",
    "39.jpg": "A patch of sunlight breaks through the trees.",
    "40.jpg": "A flock of sheep grazes nearby.",
    "41.jpg": "A weathered fence runs along the path.",
    "42.jpg": "A small pond reflects the sky.",
    "43.jpg": "A distant mountain peak is visible.",
    "44.jpg": "A strange artifact lies on the ground.",
    "45.jpg": "A hidden cave entrance is partially obscured.",
    "46.jpg": "A narrow path winds through the trees.",
    "47.jpg": "A small stream flows gently.",
    "48.jpg": "A rusted gate stands ajar.",
    "49.jpg": "A weathered signpost points to different paths.",
    "50.jpg": "A distant howl sends shivers down your spine.",
    "51.jpg": "A flickering firefly lights up the night.",
    "52.jpg": "A small animal peeks out from behind a tree.",
    "53.jpg": "A gentle breeze rustles the leaves.",
    "54.jpg": "A distant thunderstorm looms on the horizon.",
    "55.jpg": "A small bridge crosses a stream.",
    "56.jpg": "A small clearing reveals a hidden treasure.",
    "57.jpg": "A winding path leads deeper into the forest.",
    "58.jpg": "A weathered tree stands tall against the sky.",
    "59.jpg": "A distant sound of laughter echoes.",
    "60.jpg": "A small campfire crackles softly.",
    "61.jpg": "A flickering lantern hangs from a branch.",
    "62.jpg": "A pile of rocks hides something shiny.",
    "63.jpg": "A small animal scurries away.",
    "64.jpg": "A patch of mushrooms grows in the shade.",
    "65.jpg": "A colorful butterfly flits by.",
    "66.jpg": "A rustling sound comes from the bushes.",
    "67.jpg": "A faint light glimmers in the distance.",
    "68.jpg": "A strange noise echoes through the trees.",
    "69.jpg": "A pile of leaves hides something beneath.",
    "70.jpg": "A distant waterfall can be heard.",
    "71.jpg": "A small bridge crosses a stream.",
    "72.jpg": "A stone statue stands in the clearing.",
    "73.jpg": "A path leads up a steep hill.",
    "74.jpg": "A patch of sunlight breaks through the trees.",
    "75.jpg": "A flock of sheep grazes nearby.",
    "76.jpg": "A weathered fence runs along the path.",
    "77.jpg": "A small pond reflects the sky.",
    "78.jpg": "A distant mountain peak is visible.",
    "79.jpg": "A strange artifact lies on the ground.",
    "80.jpg": "A hidden cave entrance is partially obscured.",
    "81.jpg": "A narrow path winds through the trees.",
    "82.jpg": "A small stream flows gently.",
    "83.jpg": "A rusted gate stands ajar.",
    "84.jpg": "A weathered signpost points to different paths.",
    "85.jpg": "A distant howl sends shivers down your spine.",
    "86.jpg": "A flickering firefly lights up the night.",
    "87.jpg": "A small animal peeks out from behind a tree.",
    "88.jpg": "A gentle breeze rustles the leaves.",
    "89.jpg": "A distant thunderstorm looms on the horizon.",
    "90.jpg": "A strange symbol is etched into a rock.",
    "91.jpg": "A small clearing reveals a hidden treasure.",
    "92.jpg": "A winding path leads deeper into the forest.",
    "93.jpg": "A weathered tree stands tall against the sky.",
    "94.jpg": "A distant sound of laughter echoes.",
    "95.jpg": "A small campfire crackles softly.",
    "96.jpg": "A flickering lantern hangs from a branch.",
    "97.jpg": "A pile of rocks hides something shiny.",
    "98.jpg": "A small animal scurries away.",
    "99.jpg": "A patch of mushrooms grows in the shade.",
    "100.jpg": "A colorful butterfly flits by.",
  };


// Initializing story box with a message seen as the game starts...
function initializeStoryBox() {
  storyText.textContent = "You find yourself in a dark, mysterious forest... in search of your cat.";
}


// Handling all the updates for the text box where the "story" is displayed...
function updateStoryBox(x, y) {
  const storyText = document.getElementById("storyText");
  if (!storyText || !window.gridImageMap) return;

  const key = `${x},${y}`;
  const image = window.gridImageMap[key];
  const description = imageDescriptions[image] || "You see something unfamiliar...";

  const zombieAlert = generateZombieAlert(x, y);
  const isZombieCollision = zombieAlert.startsWith("A zombie attacks you!");
  if (isZombieCollision) {
    storyText.innerText = zombieAlert;
  } else {
    const catAlert = generateCatAlert(x, y); 
    storyText.innerText = `${description}\n${catAlert}\n${zombieAlert}`;
  }
}


// Function to generate the cat alerts based on player position...
function generateCatAlert(playerX, playerY) {
  const catX = window.catX;
  const catY = window.catY;

  const dx = catX - playerX;
  const dy = catY - playerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let description = "";
  let direction = "";

  // Determine direction...
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? "east" : "west";
  } else if (dy !== 0) {
    direction = dy > 0 ? "south" : "north";
  }

  // Alert based on proximity...
  if (distance === 0) {
    description = "Your cat is sitting right there, watching you with curious eyes. You reach out for her but she runs away!";
  } else if (distance <= 1) {
    description = "You hear a soft purring nearby. It sounds like your cat! You must be really close...";
  } else if (distance <= 2) {
    description = "You hear faint meowing in the distance. It sounds like you're getting closer with each step...";
  } else if (distance <= 4) {
    description = "You sense something watching from afar. Could it be your cat or something else...?";
  } else {
    description = "No sign of your cat anywhere. It's dark in the forest but you better keep looking...";
  }

  return `${description}${(description !== "No sign of any cats." && direction) ? ` \nIt seems to be coming from the ${direction}.` : ""}`;
}


// Function to generate the zombie alerts based on player position...
function generateZombieAlert(playerX, playerY) {
  const zombieX = window.zombieX;
  const zombieY = window.zombieY;

  const dx = zombieX - playerX;
  const dy = zombieY - playerY;
  const distance = Math.abs(dx) + Math.abs(dy);

  let description = "";
  let direction = "";

  // Determine direction...
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? "east" : "west";
  } else if (dy !== 0) {
    direction = dy > 0 ? "south" : "north";
  }

  // Alert based on proximity...
  if (distance === 0) {
    description = "A zombie attacks you! It bites into your arm as you try to defend yourself...\nYou are torn limb from limb, unable to escape...\nWith your last breath you hope at least your cat was able to get to safety...!";
  } else if (distance === 1) {
    description = "A zombie is dangerously close!";
  } else if (distance <= 2) {
    description = "You hear a zombie groaning very close by.";
  } else if (distance <= 4) {
    description = "You hear a zombie groaning nearby.";
  } else if (distance <= 6) {
    description = "You hear faint groaning in the distance.";
  } else {
    description = "The area seems quiet... for now.";
  }

  if (description === "The area seems quiet... for now.") {
    return description;
  }

  return `${description} ${direction ? "It sounds like it's coming from the " + direction + "." : ""}`;
}

initializeStoryBox();
window.updateStoryBox = updateStoryBox;