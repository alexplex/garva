import { supabase } from "./supabase";

export type JokeRecord = {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
};

export async function getAllJokes(): Promise<JokeRecord[]> {
  try {
    const { data: jokes, error } = await supabase
      .from('jokes')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("Error fetching jokes:", error);
      return [];
    }

    return jokes || [];
  } catch (error) {
    console.error("Error fetching jokes:", error);
    return [];
  }
}
