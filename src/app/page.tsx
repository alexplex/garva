import { JokeDeck } from "@/components/joke-deck";
import { getAllJokes } from "@/lib/jokes";
import Image from "next/image";

// Force dynamic rendering to avoid build-time database connection
export const dynamic = 'force-dynamic';

export default async function Home() {
  const jokes = await getAllJokes();
  const deckKey = jokes.map((joke) => joke.id).join("-");

  return (
    <main className="relative flex min-h-[100dvh] w-full items-center justify-center">
      {/* Logo with quarter circle background */}
      <div className="absolute left-0 top-0 z-50">
        <div className="relative">
          {/* White quarter circle background */}
          <div 
            className="absolute left-0 top-0 bg-white"
            style={{
              width: '120px',
              height: '120px',
              borderBottomRightRadius: '100%',
            }}
          />
          {/* Logo */}
          <div className="relative p-3">
            <Image 
              src="/garva-logga-03.svg"
              alt="Garva"
              width={140}
              height={140}
              priority
              style={{ transform: 'rotate(-5deg) translateY(8px)' }}
            />
          </div>
        </div>
      </div>
      
      <JokeDeck key={deckKey} initialJokes={jokes} />
    </main>
  );
}
