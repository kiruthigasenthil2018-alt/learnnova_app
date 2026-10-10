// Animal sound effects. Files live in assets/sounds/animals (made by tools/make_animal_sounds.py).
// Replace any .wav with a real recording of the same name to upgrade the sound — no code change needed.
export const ANIMAL_CLIPS = {
  Dog:require('../assets/sounds/animals/dog.wav'),
  Cat:require('../assets/sounds/animals/cat.wav'),
  Cow:require('../assets/sounds/animals/cow.wav'),
  Duck:require('../assets/sounds/animals/duck.wav'),
  Lion:require('../assets/sounds/animals/lion.wav'),
  Sheep:require('../assets/sounds/animals/sheep.wav'),
  Frog:require('../assets/sounds/animals/frog.wav'),
  Horse:require('../assets/sounds/animals/horse.wav'),
  Elephant:require('../assets/sounds/animals/elephant.wav'),
  Monkey:require('../assets/sounds/animals/monkey.wav'),
};
export const clipFor = (name) => ANIMAL_CLIPS[name] || null;
