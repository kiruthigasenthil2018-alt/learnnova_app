// Everything a Nursery/LKG learner sees, kept as data (no hard-coded lists inside screens).
const I = (s) => { const [name, emoji, extra] = s.split('|'); return { id:name, name, emoji, extra }; };

export const NUMBERS = ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'].map((name, i) => ({ id:name, name, n:i + 1, emoji:'🍎'.repeat(i + 1), big:String(i + 1) }));
export const COLORS = [
  ['Red','#E53935','🍎'],['Blue','#1E88E5','🫐'],['Yellow','#FDD835','🍌'],['Green','#43A047','🥦'],
  ['Orange','#FB8C00','🍊'],['Purple','#8E24AA','🍇'],['Pink','#F06292','🌸'],['Brown','#6D4C41','🐻'],
].map(([name, color, emoji]) => ({ id:name, name, color, emoji, big:'' }));
export const SHAPES = ['Circle|🔴','Square|🟦','Triangle|🔺','Star|⭐','Heart|❤️','Diamond|🔷','Rectangle|🟫','Oval|🥚'].map(I);
export const ANIMALS = ['Dog|🐶|Woof!','Cat|🐱|Meow!','Cow|🐮|Moo!','Duck|🦆|Quack!','Lion|🦁|Roar!','Sheep|🐑|Baa!','Frog|🐸|Ribbit!','Horse|🐴|Neigh!','Elephant|🐘|Trumpet!','Monkey|🐵|Ooh ooh!'].map(I);
export const FRUITS = ['Apple|🍎','Banana|🍌','Orange|🍊','Grapes|🍇','Mango|🥭','Watermelon|🍉','Strawberry|🍓','Pineapple|🍍','Cherry|🍒','Pear|🍐'].map(I);
export const VEGETABLES = ['Carrot|🥕','Potato|🥔','Tomato|🍅','Corn|🌽','Broccoli|🥦','Onion|🧅','Cucumber|🥒','Pepper|🌶️','Brinjal|🍆','Peas|🫛'].map(I);
export const FAMILY = ['Mother|👩','Father|👨','Baby|👶','Brother|👦','Sister|👧','Grandmother|👵','Grandfather|👴','Family|👨‍👩‍👧'].map(I);
export const BODY = ['Eyes|👀','Ears|👂','Nose|👃','Mouth|👄','Hand|✋','Foot|🦶','Tongue|👅','Teeth|🦷','Leg|🦵','Arm|💪'].map(I);
export const TRANSPORT = ['Car|🚗','Bus|🚌','Train|🚆','Aeroplane|✈️','Boat|⛵','Bicycle|🚲','Truck|🚚','Helicopter|🚁','Rocket|🚀','Auto|🛺'].map(I);
export const WEATHER = ['Sunny|☀️','Rainy|🌧️','Cloudy|☁️','Windy|💨','Snowy|❄️','Stormy|⛈️','Rainbow|🌈','Hot|🥵'].map(I);
export const NATURE = ['Tree|🌳','Flower|🌸','Mountain|⛰️','River|🏞️','Sun|☀️','Moon|🌙','Star|⭐','Butterfly|🦋','Leaf|🍃','Sea|🌊'].map(I);

// Dashboard tiles. `to` tells the screen where to navigate: [screenName, params].
export const NURSERY_TILES = [
  { id:'alphabet', title:'Alphabet', emoji:'🔤', color:'#E53935', to:['Phonics'] },
  { id:'phonics', title:'Phonics', emoji:'🔊', color:'#FB8C00', to:['PhonicsGames'] },
  { id:'numbers', title:'Numbers', emoji:'🔢', color:'#1E88E5', to:['NurseryCategory', { id:'numbers' }] },
  { id:'colors', title:'Colors', emoji:'🎨', color:'#8E24AA', to:['NurseryCategory', { id:'colors' }] },
  { id:'shapes', title:'Shapes', emoji:'🔷', color:'#00897B', to:['NurseryCategory', { id:'shapes' }] },
  { id:'animals', title:'Animals', emoji:'🦁', color:'#F57C00', to:['NurseryCategory', { id:'animals' }] },
  { id:'fruits', title:'Fruits', emoji:'🍎', color:'#E53935', to:['NurseryCategory', { id:'fruits' }] },
  { id:'vegetables', title:'Vegetables', emoji:'🥕', color:'#43A047', to:['NurseryCategory', { id:'vegetables' }] },
  { id:'family', title:'Family', emoji:'👨‍👩‍👧', color:'#EC6A8E', to:['NurseryCategory', { id:'family' }] },
  { id:'body', title:'Body Parts', emoji:'🖐️', color:'#5E35B1', to:['NurseryCategory', { id:'body' }] },
  { id:'transport', title:'Transport', emoji:'🚌', color:'#039BE5', to:['NurseryCategory', { id:'transport' }] },
  { id:'weather', title:'Weather', emoji:'🌦️', color:'#3949AB', to:['NurseryCategory', { id:'weather' }] },
  { id:'nature', title:'Nature', emoji:'🌳', color:'#2E7D32', to:['NurseryCategory', { id:'nature' }] },
  { id:'activities', title:'Activities', emoji:'🧩', color:'#D81B60', to:['Activities'] },
  { id:'games', title:'Games', emoji:'🎮', color:'#6A1B9A', to:['Main', { screen:'Games' }] },
  { id:'rhymes', title:'Rhymes', emoji:'🎵', color:'#C2185B', to:['Rhymes'] },
  { id:'tracing', title:'Tracing', emoji:'✏️', color:'#00796B', to:['Tracing'] },
];

// Generic category pages (id → title, items, quiz activity to practise it)
export const CATEGORIES = {
  numbers:{ title:'Numbers', emoji:'🔢', color:'#1E88E5', items:NUMBERS, quiz:'counting', say:(i) => `${i.n}. ${i.name}` },
  colors:{ title:'Colors', emoji:'🎨', color:'#8E24AA', items:COLORS, quiz:'colors', say:(i) => i.name },
  shapes:{ title:'Shapes', emoji:'🔷', color:'#00897B', items:SHAPES, quiz:'shapes', say:(i) => i.name },
  animals:{ title:'Animals', emoji:'🦁', color:'#F57C00', items:ANIMALS, quiz:'animals', say:(i) => `${i.name}. ${i.extra}` },
  fruits:{ title:'Fruits', emoji:'🍎', color:'#E53935', items:FRUITS, quiz:'odd', say:(i) => i.name },
  vegetables:{ title:'Vegetables', emoji:'🥕', color:'#43A047', items:VEGETABLES, quiz:'odd', say:(i) => i.name },
  family:{ title:'Family', emoji:'👨‍👩‍👧', color:'#EC6A8E', items:FAMILY, quiz:'odd', say:(i) => i.name },
  body:{ title:'Body Parts', emoji:'🖐️', color:'#5E35B1', items:BODY, quiz:'odd', say:(i) => i.name },
  transport:{ title:'Transport', emoji:'🚌', color:'#039BE5', items:TRANSPORT, quiz:'odd', say:(i) => i.name },
  weather:{ title:'Weather', emoji:'🌦️', color:'#3949AB', items:WEATHER, quiz:'odd', say:(i) => i.name },
  nature:{ title:'Nature', emoji:'🌳', color:'#2E7D32', items:NATURE, quiz:'odd', say:(i) => i.name },
};

export const ACTIVITIES = [
  { id:'colors', title:'Color Matching', emoji:'🎨', sub:'Match objects with colors', color:'#8E24AA', to:['Quiz', { mode:'nursery', activity:'colors' }] },
  { id:'counting', title:'Number Counting', emoji:'🔢', sub:'Count the objects', color:'#1E88E5', to:['Quiz', { mode:'nursery', activity:'counting' }] },
  { id:'shapes', title:'Shape Matching', emoji:'🔷', sub:'Match the shapes', color:'#00897B', to:['Quiz', { mode:'nursery', activity:'shapes' }] },
  { id:'puzzle', title:'Puzzle', emoji:'🧩', sub:'Build the word', color:'#D81B60', to:['Puzzle'] },
  { id:'animals', title:'Animal Matching', emoji:'🐶', sub:'Match animals and sounds', color:'#F57C00', to:['Quiz', { mode:'nursery', activity:'animals' }] },
  { id:'memory', title:'Memory Game', emoji:'🃏', sub:'Find the matching cards', color:'#6A1B9A', to:['Memory'] },
  { id:'rhymes', title:'Rhymes', emoji:'🎵', sub:'Sing along', color:'#C2185B', to:['Rhymes'] },
  { id:'tracing', title:'Tracing', emoji:'✏️', sub:'Trace A–Z and 0–9', color:'#00796B', to:['Tracing'] },
  { id:'odd', title:'Odd One Out', emoji:'🕵️', sub:'Find the different one', color:'#3949AB', to:['Quiz', { mode:'nursery', activity:'odd' }] },
];

// Traditional (public-domain) nursery rhymes — short versions
export const RHYMES = [
  { id:'twinkle', title:'Twinkle Twinkle', emoji:'⭐', lines:['Twinkle, twinkle, little star,','How I wonder what you are!','Up above the world so high,','Like a diamond in the sky.'], blank:['star','wonder','high','sky'] },
  { id:'baa', title:'Baa Baa Black Sheep', emoji:'🐑', lines:['Baa, baa, black sheep,','Have you any wool?','Yes sir, yes sir,','Three bags full.'], blank:['sheep','wool','sir','full'] },
  { id:'humpty', title:'Humpty Dumpty', emoji:'🥚', lines:['Humpty Dumpty sat on a wall,','Humpty Dumpty had a great fall.','All the king\'s horses and all the king\'s men','Couldn\'t put Humpty together again.'], blank:['wall','fall','men','again'] },
  { id:'rain', title:'Rain, Rain, Go Away', emoji:'🌧️', lines:['Rain, rain, go away,','Come again another day.','Little children want to play,','Rain, rain, go away.'], blank:['away','day','play','rain'] },
];
export const PUZZLE_WORDS = [['🐱','CAT'],['🐶','DOG'],['☀️','SUN'],['🎩','HAT'],['🐟','FISH'],['🐸','FROG'],['🌙','MOON'],['🍎','APPLE'],['🦁','LION'],['🚌','BUS']];
