const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const jokes = [
  { content: "Why did the scarecrow get promoted? He was outstanding in his field.", upvotes: 42, downvotes: 8 },
  { content: "Parallel lines have so much in common. It's a shame they'll never meet.", upvotes: 156, downvotes: 23 },
  { content: "I asked my dog what's two minus two. He said nothing.", upvotes: 89, downvotes: 12 },
  { content: "Why can't a bicycle stand on its own? It's two-tired.", upvotes: 234, downvotes: 45 },
  { content: "I ordered a chicken and an egg online. I'll let you know which comes first.", upvotes: 312, downvotes: 67 },
  { content: "Why don't programmers like nature? It has too many bugs.", upvotes: 521, downvotes: 34 },
  { content: "I told my suitcase there will be no vacation this year. Now I'm dealing with emotional baggage.", upvotes: 178, downvotes: 29 },
  { content: "Why did the coffee file a police report? It got mugged.", upvotes: 403, downvotes: 51 },
  { content: "I used to be a baker, but I couldn't make enough dough.", upvotes: 267, downvotes: 38 },
  { content: "What do you call fake spaghetti? An impasta.", upvotes: 198, downvotes: 42 }
];

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Joke" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "content" TEXT NOT NULL,
      "upvotes" INTEGER NOT NULL DEFAULT 0,
      "downvotes" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.joke.deleteMany();
  await prisma.joke.createMany({ data: jokes });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
