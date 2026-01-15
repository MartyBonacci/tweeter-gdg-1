import { hash } from '@node-rs/argon2';
import db from '../connection';
import { profiles, tweets, likes } from '../schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // Hash password for test users
  const passwordHash = await hash('password123', {
    memoryCost: 65536, // 64MB
    timeCost: 3,
    outputLen: 32,
    parallelism: 1,
  });

  // Create 5 test users
  console.log('Creating test users...');
  const testUsers = await db.insert(profiles).values([
    {
      username: 'alice',
      email: 'alice@example.com',
      passwordHash,
      emailVerified: true,
      bio: 'Software engineer and coffee enthusiast ☕',
    },
    {
      username: 'bob',
      email: 'bob@example.com',
      passwordHash,
      emailVerified: true,
      bio: 'Designer by day, gamer by night 🎮',
    },
    {
      username: 'charlie',
      email: 'charlie@example.com',
      passwordHash,
      emailVerified: true,
      bio: 'Travel blogger exploring the world 🌍',
    },
    {
      username: 'diana',
      email: 'diana@example.com',
      passwordHash,
      emailVerified: true,
      bio: 'Marketing maven and food lover 🍕',
    },
    {
      username: 'eve',
      email: 'eve@example.com',
      passwordHash,
      emailVerified: true,
      bio: 'Data scientist | ML enthusiast | Cat person 🐱',
    },
  ]).returning();

  console.log(`✓ Created ${testUsers.length} users`);

  // Create 20 test tweets distributed across users
  console.log('Creating test tweets...');
  const tweetContent = [
    'Just deployed my first app! 🚀',
    'Coffee first, code later ☕',
    'Anyone else excited about TypeScript 5.7?',
    'Working on a new design system',
    'Beautiful sunset today 🌅',
    'Best pizza in town at Mario\'s!',
    'React Router v7 is amazing',
    'Learning Drizzle ORM, loving it so far',
    'Weekend coding session in progress',
    'Just finished a great book on system design',
    'Who else is at the conference?',
    'New blog post coming soon!',
    'Debugging is an art form',
    'Testing in production... kidding! 😅',
    'Open source contribution #1 merged!',
    'Can\'t believe it\'s already December',
    'Morning run completed ✅',
    'Game night recommendations?',
    'This weather is perfect for coding',
    'Happy Friday everyone! 🎉',
  ];

  const testTweets = [];
  for (let i = 0; i < 20; i++) {
    const user = testUsers[i % 5]; // Distribute tweets across users
    testTweets.push({
      profileId: user.id,
      content: tweetContent[i],
    });
  }

  const insertedTweets = await db.insert(tweets).values(testTweets).returning();
  console.log(`✓ Created ${insertedTweets.length} tweets`);

  // Create 50 test likes (random distribution)
  console.log('Creating test likes...');
  const testLikes = [];
  const usedCombinations = new Set<string>();

  for (let i = 0; i < 50; i++) {
    const tweet = insertedTweets[Math.floor(Math.random() * insertedTweets.length)];
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const combo = `${tweet.id}-${user.id}`;

    // Avoid duplicate likes (composite key constraint)
    if (!usedCombinations.has(combo)) {
      testLikes.push({
        tweetId: tweet.id,
        profileId: user.id,
      });
      usedCombinations.add(combo);
    }
  }

  const insertedLikes = await db.insert(likes).values(testLikes).returning();
  console.log(`✓ Created ${insertedLikes.length} likes`);

  console.log('✅ Database seeding complete!');
  console.log(`\nTest account credentials:`);
  console.log(`  Username: alice, bob, charlie, diana, or eve`);
  console.log(`  Password: password123`);
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
