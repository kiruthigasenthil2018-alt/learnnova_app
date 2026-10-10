// A–Z phonics.  sound = IPA for parents, say = what the voice pronounces, tip = how to make the sound,
// more = extra example words, audio = slot for a recorded file (e.g. require('../assets/sounds/a.mp3')).
const VOWELS = 'AEIOU';
// Extra teaching notes for the tricky letters (shown in the "Good to know" box)
const NOTES = {
  C:'C usually says “kuh” (cat, car). Before e, i or y it can say “sss” (city).',
  G:'G usually says “guh” (goat). Before e, i or y it can say “juh” (giant).',
  K:'K and C can make the same “kuh” sound.',
  Q:'Q almost always comes with U. Together “qu” says “kwuh” (queen).',
  W:'W is a consonant. Round your lips and you will feel the sound come out.',
  X:'X is special. Words rarely start with X, so we usually hear it at the END of a word: box, fox, six.',
  Y:'Y is a consonant at the start of a word (yes), but can sound like a vowel at the end (happy).',
  Z:'Z sounds like S, but your throat buzzes. Put your fingers on your throat to feel it.',
};
const L = (letter, sound, say, word, emoji, tip, more) => {
  const list = more.split(',').map(m => { const [e, w] = m.trim().split(' '); return { emoji:e, word:w }; });
  const vowel = VOWELS.includes(letter), art = vowel ? 'an' : 'a';
  return {
    id:letter, letter, upper:letter, lower:letter.toLowerCase(), sound, say, word, emoji, audio:null, tip, more:list, vowel,
    sentence:`${letter} for ${word}`,
    kind:vowel ? `${letter} is a vowel. Vowels are A, E, I, O and U.` : `${letter} is a consonant. Consonants are all the letters that are not vowels.`,
    explain:`The letter ${letter} makes the sound “${say}”. It is the first sound you hear in ${word}. ${word} starts with ${letter}.`,
    steps:[`Look at the letter: capital ${letter} and small ${letter.toLowerCase()}.`, `Tap “Hear Sound” and listen to “${say}”.`, `Say “${say}” out loud three times.`, `Say the word: ${word}.`],
    note:NOTES[letter] || '',
    same:`Words that start with ${letter}: ${[word, ...list.map(m => m.word)].join(', ')}.`,
    // what the voice reads (clear, slow, with an example word)
    speakSound:`${letter}. ${letter} says ${say}. ${say}. ${say}. As in ${word}.`,
    speakWord:`${letter} for ${word}. ${word}. ${word} starts with ${letter}.`,
    speakExplain:`${letter} for ${word}. The letter ${letter} makes the sound ${say}. Say it with me. ${say}. ${say}. ${word}. ${word}. ${tip.replace(/[“”]/g, '')}`,
  };
};
export const PHONICS = [
  L('A', 'æ', 'ah', 'Apple', '🍎', 'Open your mouth wide and say “ah”, like at the start of apple.', '🐜 Ant,🐊 Alligator,⚓ Anchor'),
  L('B', 'b', 'buh', 'Ball', '⚽', 'Press your lips together, then pop them open: “buh”.', '🐻 Bear,🍌 Banana,🦇 Bat'),
  L('C', 'k', 'kuh', 'Cat', '🐱', 'The back of your tongue touches the roof of your mouth: “kuh”.', '🚗 Car,🐄 Cow,🎂 Cake'),
  L('D', 'd', 'duh', 'Dog', '🐶', 'Tap your tongue behind your top teeth: “duh”.', '🦆 Duck,🚪 Door,🐬 Dolphin'),
  L('E', 'ɛ', 'eh', 'Elephant', '🐘', 'Smile a little and say a short “eh”, like in egg.', '🥚 Egg,🦅 Eagle,✉️ Envelope'),
  L('F', 'f', 'fff', 'Fish', '🐟', 'Touch your top teeth to your bottom lip and blow: “fff”.', '🐸 Frog,🌸 Flower,🔥 Fire'),
  L('G', 'g', 'guh', 'Goat', '🐐', 'Lift the back of your tongue and use your voice: “guh”.', '🍇 Grapes,🎁 Gift,🦍 Gorilla'),
  L('H', 'h', 'huh', 'Hat', '🎩', 'Breathe out softly, like fogging a mirror: “huh”.', '🏠 House,🐴 Horse,🍯 Honey'),
  L('I', 'ɪ', 'ih', 'Igloo', '🧊', 'Smile and say a quick, short “ih”.', '🐛 Insect,🖋️ Ink,🦎 Iguana'),
  L('J', 'dʒ', 'juh', 'Juice', '🧃', 'Round your lips, put your tongue up, then “juh”.', '🫙 Jar,🪼 Jellyfish,🧥 Jacket'),
  L('K', 'k', 'kuh', 'Kite', '🪁', 'Same as C: the back of your tongue goes up, “kuh”.', '👑 King,🔑 Key,🦘 Kangaroo'),
  L('L', 'l', 'lll', 'Lion', '🦁', 'Touch the tip of your tongue behind your top teeth: “lll”.', '🍋 Lemon,🍃 Leaf,💡 Lamp'),
  L('M', 'm', 'mmm', 'Moon', '🌙', 'Close your lips and hum: “mmm”.', '🐒 Monkey,🐭 Mouse,🥭 Mango'),
  L('N', 'n', 'nnn', 'Nest', '🪺', 'Tongue behind your top teeth, hum through your nose: “nnn”.', '👃 Nose,📓 Notebook,🔢 Number'),
  L('O', 'ɒ', 'aw', 'Orange', '🍊', 'Open your mouth round and say “aw”.', '🐙 Octopus,🦦 Otter,🦉 Owl'),
  L('P', 'p', 'puh', 'Parrot', '🦜', 'Close your lips and pop them with a puff of air: “puh”.', '🐧 Penguin,🍕 Pizza,🐷 Pig'),
  L('Q', 'kw', 'kwuh', 'Queen', '👑', 'Say “k” and “w” together very fast: “kwuh”.', '❓ Question,🪶 Quill,🦆 Quack'),
  L('R', 'r', 'rrr', 'Rabbit', '🐰', 'Curl your tongue back a little and growl softly: “rrr”.', '🌈 Rainbow,🤖 Robot,🚀 Rocket'),
  L('S', 's', 'sss', 'Sun', '☀️', 'Keep your teeth close together and hiss like a snake: “sss”.', '🐍 Snake,⭐ Star,🧦 Sock'),
  L('T', 't', 'tuh', 'Tiger', '🐯', 'Tap your tongue behind your top teeth with a puff: “tuh”.', '🌳 Tree,🚂 Train,🐢 Turtle'),
  L('U', 'ʌ', 'uh', 'Umbrella', '☂️', 'Relax your mouth and say a short “uh”.', '🆙 Up,👨 Uncle,🦄 Unicorn'),
  L('V', 'v', 'vvv', 'Van', '🚐', 'Touch your top teeth to your bottom lip and use your voice: “vvv”.', '🎻 Violin,🌋 Volcano,🏺 Vase'),
  L('W', 'w', 'wuh', 'Whale', '🐳', 'Round your lips like a kiss, then open quickly: “wuh”.', '🍉 Watermelon,⌚ Watch,🐺 Wolf'),
  L('X', 'ks', 'ks', 'X-ray', '🩻', 'X says two sounds together: “k” and “s”, like at the end of box.', '📦 Box,🦊 Fox,🎹 Xylophone'),
  L('Y', 'j', 'yuh', 'Yo-yo', '🪀', 'Smile and slide your tongue up: “yuh”.', '🧶 Yarn,💛 Yellow,🧘 Yoga'),
  L('Z', 'z', 'zzz', 'Zebra', '🦓', 'Keep your teeth together and buzz like a bee: “zzz”.', '🤐 Zip,🏞️ Zoo,0️⃣ Zero'),
];
export const phonicsOf = (letter) => PHONICS.find(p => p.letter === letter);
