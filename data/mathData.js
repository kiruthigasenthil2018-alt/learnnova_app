// Mathematics: questions are GENERATED per grade so difficulty rises automatically (Grade 1: 2+3, Grade 3: 125+238, Grade 5: percentages).
import { rng } from './questionUtils';

const mo = (q, right, wrongs, x = {}) => ({ type:x.pic ? 'pic' : 'mcq', q, o:[right, ...wrongs.filter((w, i, a) => w !== right && a.indexOf(w) === i).slice(0, 3)], a:0, ...x });
const numOpts = (ans, R, step, dec) => {
  const s = new Set([ans]); let g = 0; const ds = [1, 2, 3, -1, -2, -3, 5, -5, 10, -10];
  while (s.size < 4 && g++ < 60) { const v = +(ans + R.pick(ds) * step * (1 + R.int(0, 1))).toFixed(dec); if (v >= 0 && v !== ans) s.add(v); }
  return [...s];
};
// numeric question: f formats numbers (e.g. add "cm")
const mq = (q, ans, R, x = {}) => { const dec = x.dec || 0, f = x.f || ((n) => (dec ? n.toFixed(dec) : String(n))); return mo(q, f(ans), numOpts(ans, R, x.step || 1, dec).map(f), x); };
const fr = (n, d) => `${n}/${d}`;
const NAMES = ['Ravi', 'Mina', 'Anu', 'Kiran', 'Sara', 'Arjun'], STUFF = ['apples', 'pencils', 'marbles', 'stickers', 'balloons'];
const EM = ['🍎', '⭐', '🎈', '🐟', '🌸'];

const GEN = {
  numbers:(g, R) => {
    if (g === 1) { if (R.f() < 0.5) { const n = R.int(3, 12), e = R.pick(EM); return mq('How many are there?', n, R, { pic:e.repeat(n) }); } const n = R.int(1, 19); return mq(`What comes after ${n}?`, n + 1, R); }
    if (g === 2) { const t = R.int(1, 9), o = R.int(1, 9); return mq(`What is the value of the digit ${t} in ${t}${o}?`, t * 10, R, { step:10 }); }
    if (g === 3) { const h = R.int(1, 9), t = R.int(0, 9), o = R.int(1, 9); return mq(`${h} hundreds + ${t} tens + ${o} ones = ?`, h * 100 + t * 10 + o, R, { step:10 }); }
    if (g === 4) { const d = R.int(1, 9), p = R.int(1, 4), digs = [0, 1, 2, 3, 4].map(() => R.int(1, 9)); digs[4 - p] = d; const n = +digs.join('');
      return mo(`What is the value of the digit ${d} in ${n.toLocaleString('en-IN')}?`, String(d * 10 ** p), [0, 1, 2, 3, 4].filter(x => x !== p).map(x => String(d * 10 ** x))); }
    const n = R.int(1200, 98999), to = R.pick([100, 1000]); return mq(`Round ${n.toLocaleString('en-IN')} to the nearest ${to}.`, Math.round(n / to) * to, R, { step:to });
  },
  addition:(g, R) => {
    if (g === 1) { const a = R.int(1, 5), b = R.int(1, 4), e = R.pick(EM); return mq(`How many in all?`, a + b, R, { pic:`${e.repeat(a)} + ${e.repeat(b)}` }); }
    const [lo, hi] = [null, null, [10, 49], [100, 499], [1000, 5999], [10000, 59999]][g], a = R.int(lo, hi), b = R.int(lo, hi);
    return mq(`${a} + ${b} = ?`, a + b, R, { step:g === 2 ? 1 : 10 ** (g - 2) });
  },
  subtraction:(g, R) => {
    if (g === 1) { const a = R.int(5, 10), b = R.int(1, 4); return mq(`${a} − ${b} = ?`, a - b, R); }
    const [lo, hi] = [null, null, [20, 99], [300, 900], [3000, 9000], [30000, 90000]][g], a = R.int(lo, hi), b = R.int(Math.floor(lo / 4), Math.floor(a * 0.8));
    return mq(`${a} − ${b} = ?`, a - b, R, { step:g === 2 ? 1 : 10 ** (g - 2) });
  },
  multiplication:(g, R) => {
    if (g === 1) { const a = R.int(2, 4), b = R.pick([2, 3, 5]), e = R.pick(EM); return mq(`${a} groups of ${b} → how many in all?`, a * b, R, { pic:(e.repeat(b) + '  ').repeat(a) }); }
    if (g === 2) { const a = R.pick([2, 5, 10]), b = R.int(1, 10); return mq(`${a} × ${b} = ?`, a * b, R, { step:a === 10 ? 10 : 1 }); }
    if (g === 3) { const a = R.int(2, 10), b = R.int(2, 10); return mq(`${a} × ${b} = ?`, a * b, R); }
    if (g === 4) { const a = R.int(12, 99), b = R.int(2, 9); return mq(`${a} × ${b} = ?`, a * b, R, { step:10 }); }
    const a = R.int(11, 35), b = R.int(11, 25); return mq(`${a} × ${b} = ?`, a * b, R, { step:10 });
  },
  division:(g, R) => {
    if (g === 1) { const k = R.int(1, 5), t = k * 2; return mq(`${t} sweets are shared equally between 2 friends. Each gets?`, k, R, { pic:'🍬'.repeat(t) }); }
    if (g === 2) { const d = R.pick([2, 5, 10]), k = R.int(1, 10); return mq(`${d * k} ÷ ${d} = ?`, k, R); }
    if (g === 3) { const d = R.int(2, 10), k = R.int(2, 10); return mq(`${d * k} ÷ ${d} = ?`, k, R); }
    if (g === 4) { const d = R.int(2, 9), k = R.int(12, 99); return mq(`${d * k} ÷ ${d} = ?`, k, R, { step:2 }); }
    if (R.f() < 0.5) { const d = R.int(3, 9), k = R.int(5, 15), rem = R.int(1, d - 1); return mq(`What is the remainder when ${d * k + rem} is divided by ${d}?`, rem, R); }
    const d = R.int(11, 25), k = R.int(5, 40); return mq(`${d * k} ÷ ${d} = ?`, k, R, { step:2 });
  },
  fractions:(g, R) => {
    if (g === 1) { const k = R.int(1, 5); return mq(`Half of ${k * 2} is...`, k, R, { pic:'🍪'.repeat(k * 2) }); }
    if (g === 2) { const k = R.int(1, 6); return R.f() < 0.5 ? mq(`One quarter (1/4) of ${k * 4} is...`, k, R) : mq(`One third (1/3) of ${k * 3} is...`, k, R); }
    if (g === 3) { const d = R.int(5, 12), ns = [1, 2, 3, 4].map(() => R.int(1, d - 1)); const u = [...new Set(ns)]; while (u.length < 4) { const n = R.int(1, d - 1); if (!u.includes(n)) u.push(n); }
      const m = Math.max(...u); return mo(`Which fraction is the greatest?`, fr(m, d), u.filter(x => x !== m).map(x => fr(x, d))); }
    if (g === 4) { const d = R.int(5, 12), a = R.int(1, Math.floor(d / 2) - 1 || 1), b = R.int(1, d - a - 1 || 1); return mo(`${fr(a, d)} + ${fr(b, d)} = ?`, fr(a + b, d), [fr(a + b, d * 2), fr(a * b, d), fr(Math.abs(a - b) || 1, d), fr(a + b + 1, d)]); }
    const b = R.pick([4, 5, 8, 10]), n = R.int(1, b - 1), k = R.int(2, 6); return mq(`${fr(n, b)} of ${b * k} = ?`, n * k, R, { step:2 });
  },
  decimals:(g, R) => {
    const rs = (n) => `₹${n}`;
    if (g === 1) { const a = R.int(1, 5), b = R.int(1, 5); return mq(`A pencil costs ₹${a} and an eraser costs ₹${b}. How much in all?`, a + b, R, { f:rs }); }
    if (g === 2) { const a = R.int(10, 50), b = R.int(10, 40); return mq(`You have ₹${a} and get ₹${b} more. How much now?`, a + b, R, { f:rs, step:5 }); }
    if (g === 3) { const n = R.int(1, 9); return mo(`3/10 as a decimal is 0.3. What is ${n}/10 as a decimal?`, (n / 10).toFixed(1), [(n / 100).toFixed(2), (n).toFixed(1), ((10 - n) / 10).toFixed(1), (n / 10 + 0.1).toFixed(1)]); }
    if (g === 4) { const a = R.int(11, 59) / 10, b = R.int(11, 39) / 10; return mq(`${a.toFixed(1)} + ${b.toFixed(1)} = ?`, +(a + b).toFixed(1), R, { dec:1, step:0.1 }); }
    const a = R.int(1100, 5999) / 100, b = R.int(110, 999) / 100; return R.f() < 0.5 ? mq(`${a.toFixed(2)} + ${b.toFixed(2)} = ?`, +(a + b).toFixed(2), R, { dec:2, step:0.1 }) : mq(`${a.toFixed(2)} − ${b.toFixed(2)} = ?`, +(a - b).toFixed(2), R, { dec:2, step:0.1 });
  },
  measurement:(g, R) => {
    if (g === 1) { const p = R.pick([['Which is heavier?', 'Elephant', ['Ant', 'Feather', 'Pencil']], ['Which is longer?', 'Bus', ['Pencil', 'Spoon', 'Button']], ['Which holds more water?', 'Bucket', ['Cup', 'Spoon', 'Thimble']], ['Which is shorter?', 'Ant', ['Giraffe', 'Tree', 'Bus']]]); return mo(p[0], p[1], p[2]); }
    if (g === 2) { const a = R.int(8, 20); return mq(`One pencil is ${a} cm long. Two such pencils end to end are how long?`, a * 2, R, { f:(n) => `${n} cm` }); }
    if (g === 3) { return R.f() < 0.5 ? (() => { const m = R.int(2, 9); return mq(`${m} m = ? cm`, m * 100, R, { step:100 }); })() : (() => { const k = R.int(2, 9); return mq(`${k} kg = ? g`, k * 1000, R, { step:1000 }); })(); }
    if (g === 4) { return R.f() < 0.5 ? (() => { const l = R.int(6, 15), w = R.int(3, 9); return mq(`A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter?`, 2 * (l + w), R, { f:(n) => `${n} cm`, step:2 }); })() : (() => { const h = R.int(2, 6); return mq(`${h} hours = ? minutes`, h * 60, R, { step:60 }); })(); }
    return R.f() < 0.5 ? (() => { const l = R.int(6, 15), w = R.int(3, 9); return mq(`The area of a rectangle ${l} m long and ${w} m wide is...`, l * w, R, { f:(n) => `${n} sq m`, step:4 }); })() : (() => { const k = R.int(1, 5), g2 = R.int(1, 9) * 100; return mq(`${k} kg ${g2} g = ? g`, k * 1000 + g2, R, { step:100 }); })();
  },
  geometry:(g, R) => {
    if (g === 1) { const s = R.pick([['🔴', 'Circle'], ['🔺', 'Triangle'], ['🟦', 'Square'], ['⭐', 'Star']]); return mo('What shape is this?', s[1], ['Circle', 'Triangle', 'Square', 'Star', 'Heart'].filter(x => x !== s[1]), { pic:s[0] }); }
    if (g === 2) { const s = R.pick([['triangle', 3], ['square', 4], ['pentagon', 5], ['hexagon', 6]]); return mq(`How many sides does a ${s[0]} have?`, s[1], R); }
    if (g === 3) { const s = R.pick([['an angle of 90°', 'right angle'], ['an angle of 45°', 'acute angle'], ['an angle of 120°', 'obtuse angle'], ['an angle of 180°', 'straight angle']]); return mo(`${s[0][0].toUpperCase() + s[0].slice(1)} is called...`, s[1], ['right angle', 'acute angle', 'obtuse angle', 'straight angle'].filter(x => x !== s[1])); }
    if (g === 4) { if (R.f() < 0.5) { const s = R.int(3, 15); return mq(`The perimeter of a square with side ${s} cm is...`, 4 * s, R, { f:(n) => `${n} cm`, step:4 }); } const a = R.int(30, 80), b = R.int(30, 80); return mq(`Two angles of a triangle are ${a}° and ${b}°. The third angle is...`, 180 - a - b, R, { f:(n) => `${n}°`, step:5 }); }
    if (R.f() < 0.5) { const b = R.int(4, 20) * 2, h = R.int(3, 12); return mq(`Area of a triangle with base ${b} cm and height ${h} cm is...`, b * h / 2, R, { f:(n) => `${n} sq cm`, step:3 }); }
    const a = R.int(35, 80), b = R.int(35, 80); return mq(`Two angles of a triangle are ${a}° and ${b}°. The third angle is...`, 180 - a - b, R, { f:(n) => `${n}°`, step:5 });
  },
  words:(g, R) => {
    const n = R.pick(NAMES), n2 = R.pick(NAMES.filter(x => x !== n)), it = R.pick(STUFF);
    if (g === 1) { const a = R.int(3, 8), b = R.int(1, 3); return R.f() < 0.5 ? mq(`${n} has ${a} ${it}. A friend gives ${b} more. How many now?`, a + b, R) : mq(`${n} had ${a + b} ${it}. ${b} were lost. How many are left?`, a, R); }
    if (g === 2) { const a = R.int(30, 70), b = R.int(10, 25); return R.f() < 0.5 ? mq(`A shop has ${a} ${it} and gets ${b} more. How many in all?`, a + b, R, { step:2 }) : mq(`${n} has ${a} ${it} and gives ${b} to ${n2}. How many are left?`, a - b, R, { step:2 }); }
    if (g === 3) { const a = R.int(10, 20), b = R.int(3, 9); const k = R.int(0, 2);
      if (k === 0) return mq(`${n} has ${a} apples. He gives ${b} apples to his friend. How many apples are left?`, a - b, R);
      if (k === 1) { const c = R.int(3, 8); return mq(`A box holds ${b} eggs. How many eggs are in ${c} such boxes?`, b * c, R); }
      return mq(`${a * b} sweets are shared equally among ${b} children. How many does each child get?`, a, R); }
    if (g === 4) { const p = R.int(6, 12), k = R.int(3, 6), gone = R.int(5, 15); return mq(`A pack has ${p} pencils. ${n} buys ${k} packs and gives away ${gone}. How many pencils are left?`, p * k - gone, R, { step:2 }); }
    if (R.f() < 0.65) { const [N, pc] = R.pick([[250, 20], [200, 25], [400, 10], [500, 20], [300, 10], [120, 25], [80, 25]]); return mq(`A shop has ${N} items. ${pc}% are sold. How many items remain?`, N - N * pc / 100, R, { step:5 }); }
    const sp = R.pick([40, 50, 60, 80]), h = R.int(2, 5); return mq(`A train travels at ${sp} km per hour for ${h} hours. How far does it go?`, sp * h, R, { f:(n) => `${n} km`, step:20 });
  },
};

export const MATH_TOPICS = [
  { key:'numbers', title:'Numbers', emoji:'🔟', intro:['Numbers help us count. Count each object once: 1, 2, 3… Numbers up to 20.', 'Two-digit numbers have tens and ones. In 47, the 4 means 4 tens (40) and the 7 means 7 ones.', 'Three-digit numbers have hundreds, tens and ones. 532 = 5 hundreds + 3 tens + 2 ones.', 'Place value goes up to ten-thousands. In 47,358 the digit 7 stands for 7,000.', 'Rounding makes numbers easy: look at the next digit. 5 or more? Round up. Less than 5? Round down.'] },
  { key:'addition', title:'Addition', emoji:'➕', intro:['Addition means putting groups together. 2 + 3 = 5. Count all the things.', 'Add the ones first, then the tens. 23 + 14: ones 3 + 4 = 7, tens 2 + 1 = 3 → 37.', 'Add column by column from the ones. Carry over when a column makes 10 or more. 125 + 238 = 363.', 'Line up digits by place value, add from right to left and carry. Check by estimating.', 'Large numbers add the same way: line up places, carry, and double-check with an estimate.'] },
  { key:'subtraction', title:'Subtraction', emoji:'➖', intro:['Subtraction means taking away. 7 − 3 = 4. Start with 7, take away 3.', 'Subtract the ones, then the tens. 58 − 23: 8 − 3 = 5, 5 − 2 = 3 → 35.', 'Subtract column by column. Borrow when the top digit is smaller. 502 − 237 = 265.', 'Borrow from the next place when needed. Check by adding your answer back.', 'Check big subtractions: the answer + the smaller number should equal the bigger number.'] },
  { key:'multiplication', title:'Multiplication', emoji:'✖️', intro:['Multiplication is adding equal groups. 3 groups of 2 = 2 + 2 + 2 = 6.', 'Learn the tables of 2, 5 and 10. 5 × 3 = 15. Skip count: 5, 10, 15.', 'Tables up to 10 help you multiply fast. 7 × 8 = 56. You can multiply in any order.', 'Multiply a 2-digit number by 1 digit: 23 × 4 = (20 × 4) + (3 × 4) = 92.', 'Multiply 2-digit by 2-digit with partial products: 23 × 12 = (23 × 10) + (23 × 2) = 276.'] },
  { key:'division', title:'Division', emoji:'➗', intro:['Division is sharing equally. 6 sweets shared between 2 friends = 3 each.', 'Division undoes multiplication. 10 ÷ 2 = 5 because 2 × 5 = 10.', 'Use your tables to divide. 36 ÷ 6 = 6 because 6 × 6 = 36.', 'Divide bigger numbers step by step. 96 ÷ 4 = 24.', 'Long division and remainders: 47 ÷ 5 = 9 remainder 2, because 5 × 9 + 2 = 47.'] },
  { key:'fractions', title:'Fractions', emoji:'🍕', intro:['A fraction is a part of a whole. Half means 2 equal parts. Half of 8 is 4.', 'Halves (1/2), thirds (1/3) and quarters (1/4) are equal parts. 1/4 of 12 is 3.', 'The top number is the numerator, the bottom is the denominator. With the same denominator, the bigger numerator is the bigger fraction.', 'Add fractions with the same denominator by adding the numerators: 2/7 + 3/7 = 5/7.', 'To find a fraction of a number, divide by the denominator, then multiply by the numerator. 3/4 of 20 = 5 × 3 = 15.'] },
  { key:'decimals', title:'Decimals', emoji:'🔹', intro:['Money uses rupees. ₹2 + ₹3 = ₹5. Count coins and notes carefully.', 'Add and subtract money: ₹20 + ₹15 = ₹35.', 'Tenths: 3/10 = 0.3. The decimal point separates whole numbers from parts.', 'Add decimals by lining up the decimal points: 2.4 + 1.3 = 3.7.', 'Hundredths: 0.25 means 25 parts out of 100. Add and subtract decimals with 2 places.'] },
  { key:'measurement', title:'Measurement', emoji:'📏', intro:['We measure length, weight and capacity. An elephant is heavier than an ant. A bus is longer than a pencil.', 'Length is measured in centimetres (cm). A pencil is about 15 cm long.', '100 cm = 1 m and 1000 g = 1 kg. To change metres to centimetres, multiply by 100.', 'Perimeter is the distance around a shape. Rectangle: 2 × (length + width). 1 hour = 60 minutes.', 'Area of a rectangle = length × width. 1 kg = 1000 g and 1 L = 1000 ml.'] },
  { key:'geometry', title:'Geometry', emoji:'🔺', intro:['Shapes are all around us: circle, square, triangle, rectangle.', 'Shapes have sides and corners. A triangle has 3 sides. A square has 4 equal sides.', 'Angles: a right angle is 90°, an acute angle is smaller than 90°, an obtuse angle is bigger than 90°.', 'Perimeter of a square = 4 × side. The angles of a triangle add up to 180°.', 'Area of a rectangle = length × width. Area of a triangle = ½ × base × height.'] },
  { key:'words', title:'Word Problems', emoji:'🧮', intro:['Read the story, find the numbers, then decide: add or take away?', 'Add when things join. Subtract when things are taken away.', 'Choose the right operation: add, subtract, multiply or divide. Check that your answer makes sense.', 'Some problems need two steps. Solve the first step, then use that answer in the second.', 'Percent means "out of 100". 20% of 250 = 250 ÷ 100 × 20 = 50. Distance = speed × time.'] },
];

const safeGrade = (g) => { const n = Math.round(+g); return n >= 1 && n <= 5 ? n : 3; };
export const mathQuestion = (topicKey, grade, seed) => GEN[topicKey](safeGrade(grade), rng(seed));
