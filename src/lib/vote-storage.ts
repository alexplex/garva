/**
 * localStorage utilities for tracking user votes
 * Format: { "joke-123": "upvote", "joke-456": "downvote" }
 */

const STORAGE_KEY = "garva-votes";

export type VoteType = "upvote" | "downvote" | null;

export function getVoteForJoke(jokeId: number): VoteType {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const votes = JSON.parse(stored) as Record<string, string>;
    const vote = votes[`joke-${jokeId}`];
    
    if (vote === "upvote" || vote === "downvote") {
      return vote;
    }
    return null;
  } catch (error) {
    console.error("Error reading vote from localStorage:", error);
    return null;
  }
}

export function setVoteForJoke(jokeId: number, vote: VoteType): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const votes = stored ? (JSON.parse(stored) as Record<string, string>) : {};
    
    const key = `joke-${jokeId}`;
    
    if (vote === null) {
      delete votes[key];
    } else {
      votes[key] = vote;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch (error) {
    console.error("Error saving vote to localStorage:", error);
  }
}

export function getAllVotes(): Record<string, VoteType> {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    return JSON.parse(stored) as Record<string, VoteType>;
  } catch (error) {
    console.error("Error reading votes from localStorage:", error);
    return {};
  }
}
