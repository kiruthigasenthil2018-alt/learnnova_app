// Vocabulary categories for English.  W('word|emoji|meaning|example')
const W = (s) => { const [word, emoji, meaning, example] = s.split('|'); return { word, emoji, meaning, example }; };
export const VOCAB = [
  { id:'feelings', title:'Feelings', emoji:'😊', color:'#EC6A8E', words:[
    'happy|😊|Feeling joy and pleasure.|I am happy when I play with my friends.', 'sad|😢|Feeling unhappy.|She was sad when her toy broke.', 'angry|😠|Feeling very cross about something.|Dad was angry when the milk spilled.',
    'excited|🤩|Very happy about something that will happen.|We are excited about the trip.', 'scared|😨|Afraid of something.|The kitten was scared of thunder.', 'proud|🥹|Feeling good about something you or others did.|Mum is proud of my drawing.',
    'tired|😴|Needing rest or sleep.|I was tired after the race.', 'surprised|😲|Feeling shocked because of something unexpected.|He was surprised by the gift.'].map(W) },
  { id:'actions', title:'Action Words', emoji:'🏃', color:'#2463EB', words:[
    'run|🏃|To move fast on your feet.|I run in the park.', 'jump|🤸|To push yourself up into the air.|The frog can jump high.', 'whisper|🤫|To speak very softly.|Please whisper in the library.',
    'climb|🧗|To go up using hands and feet.|Monkeys climb trees.', 'shout|📣|To speak very loudly.|Do not shout in class.', 'giggle|🤭|To laugh in a silly, quiet way.|The baby began to giggle.',
    'gather|🧺|To bring things together.|We gather shells at the beach.', 'wander|🚶|To walk around with no fixed plan.|We wander through the garden.'].map(W) },
  { id:'describing', title:'Describing Words', emoji:'🌈', color:'#8E24AA', words:[
    'enormous|🐘|Extremely big.|An elephant is enormous.', 'tiny|🐜|Very, very small.|An ant is tiny.', 'fluffy|🐑|Soft and light like wool.|The sheep has fluffy wool.',
    'delicious|🍰|Tastes very good.|The cake was delicious.', 'sparkling|✨|Shining with little flashes of light.|The stars were sparkling.', 'gentle|🕊️|Soft and kind, not rough.|Be gentle with the puppy.',
    'brave|🦸|Not afraid to do something difficult.|The brave girl helped the cat.', 'curious|🧐|Wanting to learn or know more.|A curious child asks many questions.'].map(W) },
  { id:'opposites', title:'Opposites', emoji:'↔️', color:'#00796B', words:[
    'hot|🔥|Opposite of cold: very warm.|The soup is hot.', 'cold|🧊|Opposite of hot: not warm.|The ice is cold.', 'up|⬆️|Opposite of down: to a higher place.|The balloon went up.',
    'down|⬇️|Opposite of up: to a lower place.|The ball rolled down.', 'full|🥛|Opposite of empty: has no more room.|The glass is full.', 'empty|🫙|Opposite of full: has nothing inside.|The jar is empty.',
    'early|🌅|Opposite of late: before the usual time.|I woke up early.', 'late|🌙|Opposite of early: after the usual time.|We reached school late.'].map(W) },
  { id:'school', title:'School', emoji:'🏫', color:'#B85C00', words:[
    'teacher|👩‍🏫|A person who helps you learn.|My teacher reads us stories.', 'classroom|🏫|A room where students learn.|Our classroom is bright.', 'homework|📚|School work done at home.|I finish my homework after tea.',
    'library|📖|A place with many books to borrow.|I borrow books from the library.', 'playground|🛝|An outdoor place to play at school.|We play on the playground.', 'pencil|✏️|A tool to write or draw with.|I draw with a pencil.',
    'spell|🔤|To say the letters of a word in order.|Can you spell "friend"?', 'lesson|📝|Something you are taught.|Today\'s lesson is about plants.'].map(W) },
  { id:'nature', title:'Nature & Weather', emoji:'🌦️', color:'#43A047', words:[
    'breeze|🍃|A gentle, light wind.|A cool breeze blew in.', 'thunder|⛈️|The loud sound after lightning.|The thunder was very loud.', 'rainbow|🌈|Colours in the sky when sun shines through rain.|We saw a rainbow after the rain.',
    'puddle|💦|A small pool of water on the ground.|I jumped in the puddle.', 'forest|🌲|A large area full of trees.|Deer live in the forest.', 'river|🏞️|A long stream of water that flows to the sea.|The river flows past our village.',
    'harvest|🌾|To gather ripe crops.|Farmers harvest rice in autumn.', 'blossom|🌸|A flower on a tree.|Cherry trees blossom in spring.'].map(W) },
  { id:'food', title:'Food & Drink', emoji:'🍎', color:'#E53935', words:[
    'breakfast|🥞|The first meal of the day.|I eat breakfast at 7 o\'clock.', 'nutritious|🥦|Good for your body and health.|Vegetables are nutritious.', 'juicy|🍊|Full of juice.|The orange is juicy.',
    'crispy|🥨|Hard and crunchy.|Crispy toast is yummy.', 'recipe|📜|Instructions to cook something.|Grandma shared her recipe.', 'ripe|🍌|Ready to eat (for fruit).|The mango is ripe.',
    'thirsty|🥤|Needing something to drink.|I am thirsty after running.', 'hungry|🍽️|Needing food.|The hungry boy ate two rotis.'].map(W) },
  { id:'family', title:'Family & Home', emoji:'🏠', color:'#5E35B1', words:[
    'family|👨‍👩‍👧|People who are related and live together.|My family eats dinner together.', 'neighbour|🏘️|A person who lives near you.|Our neighbour is very kind.', 'cousin|🧒|The child of your uncle or aunt.|My cousin visits in summer.',
    'grandparent|👵|The parent of your mother or father.|My grandparent tells me stories.', 'kitchen|🍳|The room where food is cooked.|Mum cooks in the kitchen.', 'garden|🌻|A place where flowers or vegetables grow.|We water the garden.',
    'celebrate|🎉|To do something fun for a special day.|We celebrate Diwali with lamps.', 'cosy|🛋️|Warm, comfortable and safe.|The room felt cosy.'].map(W) },
];
export const vocabOf = (id) => VOCAB.find(v => v.id === id);
export const allVocab = () => VOCAB.flatMap(c => c.words.map(w => ({ ...w, cat:c.id })));
