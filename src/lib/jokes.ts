import { prisma } from "./prisma";

export type JokeRecord = {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
};

export async function getAllJokes(): Promise<JokeRecord[]> {
  const jokes = await prisma.joke.findMany({
    orderBy: { id: "asc" },
  });

  return jokes;
}
