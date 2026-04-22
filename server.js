const express = require('express');
const cors = require('cors');

const { predictions, categories } = require('./data/predictions');
const { timeframes, timeframeTypes } = require('./data/timeframes');
const easterEggs = require('./data/eastereggs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomCategory = () => getRandomItem(categories);

const getRandomTimeframe = () => {
  const type = getRandomItem(timeframeTypes);
  return getRandomItem(timeframes[type]);
};

const generateLuckyNumbers = () => {
  const numbers = new Set();
  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 49) + 1);
  }
  return [...numbers].sort((a, b) => a - b);
};

const calculateCosmicEnergy = (name) => {
  let energy = 0;
  for (let char of name.toLowerCase()) {
    energy += char.charCodeAt(0);
  }
  return ((energy * 7) % 100) + 1;
};

const getDayModifier = () => {
  const day = new Date().getDay();

  const map = {
    0: { emoji: "🌅", mood: "лінивий", prefix: "Неділя каже: " },
    1: { emoji: "😫", mood: "понеділковий", prefix: "Понеділок посилює драму: " },
    2: { emoji: "🐢", mood: "повільний", prefix: "" },
    3: { emoji: "🐸", mood: "середа-жаба", prefix: "Середа-жаба каже: " },
    4: { emoji: "⚡", mood: "майже п'ятниця", prefix: "" },
    5: { emoji: "🎉", mood: "п'ятничний", prefix: "П'ЯТНИЦЯ! " },
    6: { emoji: "😴", mood: "субота", prefix: "Субота шепоче: " }
  };

  return map[day];
};

const checkEasterEgg = (name) => {
  const n = name.toLowerCase().trim();
  return easterEggs.names[n] || null;
};
app.get('/', (req, res) => {
  res.json({
    name: "🔮 Oracle of Chaos API",
    version: "1.0.0",
    endpoints: [
      "/predict?name=Ім'я",
      "/predict/category/:category",
      "/destiny/:name",
      "/lucky-numbers",
      "/cosmic-energy?name=Ім'я",
      "/random-excuse"
    ]
  });
});
app.get('/predict', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      error: "Дай ім'я → ?name=Таня 🔮"
    });
  }

  const egg = checkEasterEgg(name);
  if (egg) {
    return res.json({
      type: "EASTER_EGG",
      ...egg
    });
  }

  const category = getRandomCategory();
  const prediction = getRandomItem(predictions[category]);
  const timeframe = getRandomTimeframe();
  const day = getDayModifier();

  res.json({
    name,
    greeting: `${day.emoji} Вітаю, ${name}!`,
    category,
    prediction: prediction,
    timeframe: `Це станеться: ${timeframe}`,
    energy: calculateCosmicEnergy(name),
    mood: day.mood,
    timestamp: new Date().toISOString()
  });
});
app.get('/predict/category/:category', (req, res) => {
  const { category } = req.params;
  const { name } = req.query;

  if (!categories.includes(category)) {
    return res.status(400).json({
      error: "Такої категорії нема",
      available: categories
    });
  }

  res.json({
    name: name || "Анонім",
    category,
    prediction: getRandomItem(predictions[category]),
    timeframe: getRandomTimeframe()
  });
});
app.get('/destiny/:name', (req, res) => {
  const { name } = req.params;

  const map = {};

  categories.forEach(cat => {
    if (cat !== 'special') {
      map[cat] = {
        prediction: getRandomItem(predictions[cat]),
        chance: `${Math.floor(Math.random() * 100)}%`
      };
    }
  });

  res.json({
    name,
    energy: calculateCosmicEnergy(name),
    destiny: map,
    luckyNumbers: generateLuckyNumbers()
  });
});
app.get('/lucky-numbers', (req, res) => {
  res.json({
    numbers: generateLuckyNumbers()
  });
});
app.get('/cosmic-energy', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      error: "Потрібне ім'я"
    });
  }

  const energy = calculateCosmicEnergy(name);

  res.json({
    name,
    energy
  });
});

app.get('/random-excuse', (req, res) => {
  const excuses = [
    "У мене працює",
    "Це не баг, це фіча",
    "Git з'їв код",
    "DNS винен",
    "Cache очисти"
  ];

  res.json({
    excuse: getRandomItem(excuses)
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Не знайдено 👻"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});