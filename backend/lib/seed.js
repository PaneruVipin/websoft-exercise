const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';

const names = ['Arya', 'Kiran', 'Riya', 'Dev', 'Simran', 'Ishaan'];
const emails = names.map((_, i) => `test-${i + 1}@test.com`);
const password = 'password';

const sampleConversations = [
  [
    "Hey, what's up?",
    "Not much, just coding and crushing deadlines 😎",
    "Sounds intense! You need a chai break.",
    "Only if you're making it ☕",
    "Deal. But only if I get one of those smiley texts in return.",
    "😊 That one? Or the wink one? 😉"
  ],
  [
    "You're online again. Coincidence or destiny?",
    "Maybe my Wi-Fi just likes you.",
    "So we both have good taste 😁",
    "You saying I’m your type?",
    "Not saying… but I’m also not denying 👀"
  ],
  [
    "If I were a cat, I’d spend all 9 lives talking to you.",
    "Wow, that’s smooth. Practiced?",
    "Only in my head, 100 times.",
    "Glad I’m finally hearing it out loud 😊",
    "You should’ve started sooner — I like this side of you.",
    "Then stay online. You’ll see more."
  ]
];

const getRandomConvo = () =>
  sampleConversations[Math.floor(Math.random() * sampleConversations.length)];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB');

    await User.deleteMany({});
    await Message.deleteMany({});

    const users = [];

    for (let i = 0; i < 6; i++) {
      const user = new User({ email: emails[i], password, fullname: names[i] });
      await user.save();
      users.push(user);
    }

    console.log('✅ Users created');

    const messages = [];
    let baseTime = new Date();

    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (i === j) continue;

        const sender = users[i];
        const receiver = users[j];
        const convo = getRandomConvo();

        let currentSender = sender;
        let currentReceiver = receiver;

        convo.forEach((line, idx) => {
          const time = new Date(baseTime.getTime() + idx * 60000); // 1 min gap
          messages.push({
            sender: currentSender._id,
            receiver: currentReceiver._id,
            content: line,
            createdAt: time,
            updatedAt: time,
            isRead: Math.random() < 0.9
          });

          // Swap sender/receiver for next message
          [currentSender, currentReceiver] = [currentReceiver, currentSender];
        });

        // Offset base time for next conversation thread
        baseTime = new Date(baseTime.getTime() + 600000); // 10 min later
      }
    }

    await Message.insertMany(messages);
    console.log(`✅ Inserted ${messages.length} messages across all user pairs`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
