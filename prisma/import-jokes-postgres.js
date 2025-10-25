/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper to clean up HTML - remove wrapper divs but keep paragraph tags
function cleanJokeContent(html) {
  // Remove extra wrapper divs and unnecessary HTML classes
  let cleaned = html
    .replace(/<div[^>]*>/g, "")
    .replace(/<\/div>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, "").trim();

  return cleaned;
}

// Parse CSV manually (simple parser for this structure)
function parseCSV(content) {
  const lines = content.split("\n");
  const jokes = [];
  let inQuote = false;
  let jokeText = "";

  for (let i = 1; i < lines.length; i++) {
    // Skip header
    const line = lines[i];

    if (!inQuote && line.startsWith('"')) {
      // Start of a new joke
      inQuote = true;
      jokeText = line.substring(1); // Remove leading quote
    } else if (inQuote) {
      jokeText += "\n" + line;
    }

    // Check if quote ends
    if (inQuote && line.includes('",')) {
      // End of joke content
      const lastQuoteIndex = jokeText.lastIndexOf('",');
      const content = jokeText.substring(0, lastQuoteIndex);

      // Extract upvotes and downvotes from the rest of the line
      const rest = jokeText.substring(lastQuoteIndex + 2);
      const parts = rest.split(",");

      if (parts.length === 2) {
        const upvotes = parseInt(parts[0].trim(), 10);
        const downvotes = parseInt(parts[1].trim(), 10);

        if (!isNaN(upvotes) && !isNaN(downvotes)) {
          jokes.push({
            content: cleanJokeContent(content),
            upvotes,
            downvotes,
          });
        }
      }

      // Reset for next joke
      inQuote = false;
      jokeText = "";
    }
  }

  return jokes;
}

async function importJokes() {
  try {
    console.log("📖 Reading CSV file...");
    const csvPath = path.join(
      __dirname,
      "..",
      "import",
      "Skamt-Export-2025-October-25-1643.csv"
    );
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    console.log("🔍 Parsing CSV...");
    const jokes = parseCSV(csvContent);
    console.log(`✅ Found ${jokes.length} jokes to import`);

    // Clear existing jokes
    console.log("🗑️  Clearing existing jokes...");
    await prisma.joke.deleteMany();

    // Import new jokes in batches (PostgreSQL is better with batch inserts)
    console.log("💾 Importing jokes...");
    const batchSize = 50;
    for (let i = 0; i < jokes.length; i += batchSize) {
      const batch = jokes.slice(i, i + batchSize);
      await prisma.joke.createMany({
        data: batch,
      });
      console.log(`   Imported ${Math.min(i + batchSize, jokes.length)}/${jokes.length}...`);
    }

    console.log(`✨ Successfully imported ${jokes.length} jokes!`);
    console.log("\n📊 Sample of imported jokes:");
    const samples = await prisma.joke.findMany({
      take: 3,
      orderBy: { upvotes: "desc" },
    });
    samples.forEach((joke) => {
      console.log(
        `\n   ID: ${joke.id}, Upvotes: ${joke.upvotes}, Downvotes: ${joke.downvotes}`
      );
      console.log(`   Content: ${joke.content.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error("❌ Error importing jokes:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importJokes();
