import { JokeDeck } from "@/components/joke-deck";
import { getAllJokes } from "@/lib/jokes";

export default async function Home() {
  const jokes = await getAllJokes();
  const deckKey = jokes.map((joke) => joke.id).join("-");

  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <JokeDeck key={deckKey} initialJokes={jokes} />
    </main>
  );
}
