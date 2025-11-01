"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { getVoteForJoke, setVoteForJoke, type VoteType } from "@/lib/vote-storage";

type Joke = {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
};

type DeckCard = Joke & {
  color: string;
  key: string;
};

type DeckState = {
  timeline: DeckCard[];
  pool: Joke[];
  position: number;
  lastDirection: number;
};

const SWIPE_THRESHOLD = 80;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomColor(): string {
  const channel = () => Math.floor(Math.random() * 181);
  const r = channel();
  const g = channel();
  const b = channel();
  return `rgb(${r}, ${g}, ${b})`;
}

function createCard(joke: Joke): DeckCard {
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${joke.id}-${Date.now()}-${Math.random()}`;
  return {
    ...joke,
    color: randomColor(),
    key: uniqueId,
  };
}

function drawCard(pool: Joke[], source: Joke[]): { card: DeckCard; pool: Joke[] } {
  if (source.length === 0) {
    throw new Error("No jokes available.");
  }

  let workingPool = pool.length ? [...pool] : shuffle(source);
  if (workingPool.length === 0) {
    workingPool = shuffle(source);
  }

  const [next, ...rest] = workingPool;
  return { card: createCard(next), pool: rest };
}

function initDeck(initialJokes: Joke[]): DeckState {
  if (!initialJokes.length) {
    return { timeline: [], pool: [], position: 0, lastDirection: 1 };
  }

  const shuffled = shuffle(initialJokes);
  const firstDraw = drawCard(shuffled, initialJokes);
  const secondDraw = drawCard(firstDraw.pool, initialJokes);

  return {
    timeline: [firstDraw.card, secondDraw.card],
    pool: secondDraw.pool,
    position: 0,
    lastDirection: 1,
  };
}

export function JokeDeck({ initialJokes }: { initialJokes: Joke[] }) {
  const [state, setState] = useState<DeckState>(() => initDeck(initialJokes));
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [peekDirection, setPeekDirection] = useState<"forward" | "backward">(
    "forward"
  );

  // Use a timeout to avoid ESLint warning about setState in effect
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Update vote counts in the deck state
  const updateJokeVotes = useCallback((jokeId: number, upvotes: number, downvotes: number) => {
    setState((prev) => ({
      ...prev,
      timeline: prev.timeline.map(card => 
        card.id === jokeId 
          ? { ...card, upvotes, downvotes }
          : card
      ),
    }));
  }, []);

  const ensureNextCard = useCallback(
    (currentState: DeckState) => {
      let state = currentState;
      while (state.timeline.length < state.position + 2) {
        const { card, pool } = drawCard(state.pool, initialJokes);
        state = {
          ...state,
          timeline: [...state.timeline, card],
          pool,
        };
      }
      return state;
    },
    [initialJokes]
  );

  const goForward = useCallback(() => {
    setState((prev) => {
      const current = prev.timeline[prev.position] ?? null;
      if (!current) {
        return prev;
      }
      const prepared = ensureNextCard(prev);
      const nextPosition = Math.min(
        prepared.timeline.length - 1,
        prepared.position + 1
      );
      const advanced = {
        ...prepared,
        position: nextPosition,
        lastDirection: 1,
      };
      return ensureNextCard(advanced);
    });
  }, [ensureNextCard]);

  const goBackward = useCallback(() => {
    setState((prev) => {
      if (prev.position === 0) {
        return prev;
      }
      return {
        ...prev,
        position: Math.max(0, prev.position - 1),
        lastDirection: -1,
      };
    });
  }, []);

  const currentCard = state.timeline[state.position] ?? null;
  const nextCard = state.timeline[state.position + 1] ?? null;
  const previousCard = state.timeline[state.position - 1] ?? null;
  const backdropCard =
    (peekDirection === "backward" ? previousCard : nextCard) ??
    nextCard ??
    previousCard ??
    null;

  const snapBack = useCallback(() => {
    void controls
      .start({
        x: 0,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 320,
          damping: 32,
        },
      })
      .finally(() => setPeekDirection("forward"));
  }, [controls, setPeekDirection]);

  const animateAndShift = useCallback(
    async (direction: "forward" | "backward") => {
      if (isAnimating || !currentCard) {
        return;
      }
      if (direction === "backward" && !previousCard) {
        snapBack();
        return;
      }
      setIsAnimating(true);
      const exitX = direction === "forward" ? "-130%" : "130%";
      const exitRotate = direction === "forward" ? -12 : 12;
      await controls.start({
        x: exitX,
        rotate: exitRotate,
        transition: {
          type: "spring",
          stiffness: 280,
          damping: 20,
          mass: 0.7,
        },
      });
      if (direction === "forward") {
        goForward();
      } else {
        goBackward();
      }
      controls.set({ x: 0, rotate: 0 });
      setIsAnimating(false);
      setPeekDirection("forward");
    },
    [
      controls,
      currentCard,
      goBackward,
      goForward,
      isAnimating,
      previousCard,
      snapBack,
      setPeekDirection,
    ]
  );

  if (!currentCard) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-black/30 text-white/70">
        Garva needs at least one joke in the database. Add some and refresh.
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {backdropCard && (
        <article
          key={backdropCard.key}
          className="absolute inset-0 flex flex-col text-white"
          style={{ backgroundColor: backdropCard.color, zIndex: 5 }}
          aria-hidden="true"
        >
          <CardContent joke={backdropCard} muted onVoteUpdate={updateJokeVotes} />
        </article>
      )}

      <motion.article
        key={currentCard.key}
        className="absolute inset-0 flex flex-col text-white"
        style={{ backgroundColor: currentCard.color, zIndex: 10 }}
        drag={isAnimating ? false : "x"}
        dragElastic={0.6}
        dragConstraints={{ left: 0, right: 0 }}
        animate={controls}
        onDrag={(_, info) => {
          if (isAnimating) return;
          if (info.offset.x > 20 && previousCard) {
            setPeekDirection((dir) =>
              dir === "backward" ? dir : "backward"
            );
          } else if (info.offset.x < -20 && nextCard) {
            setPeekDirection((dir) =>
              dir === "forward" ? dir : "forward"
            );
          }
        }}
        onDragEnd={(_, info) => {
          if (!currentCard) return;
          if (info.offset.x < -SWIPE_THRESHOLD) {
            void animateAndShift("forward");
          } else if (info.offset.x > SWIPE_THRESHOLD && previousCard) {
            void animateAndShift("backward");
          } else {
            snapBack();
          }
        }}
      >
        <CardContent joke={currentCard} onVoteUpdate={updateJokeVotes} />
      </motion.article>
    </div>
  );
}

function CardContent({ joke, muted, onVoteUpdate }: { 
  joke: DeckCard; 
  muted?: boolean;
  onVoteUpdate?: (jokeId: number, upvotes: number, downvotes: number) => void;
}) {
  return (
    <div className="flex h-full min-h-[100dvh] flex-col px-6 py-10 sm:px-12 sm:py-16 select-none">
      <div className="flex flex-1 items-center justify-center text-center select-none">
        <div 
          className="text-3xl font-bold leading-tight sm:text-4xl select-none [&>p]:mb-4 [&>p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: joke.content }}
        />
      </div>
      <div className="flex justify-center pb-20">
        <VoteButtons 
          key={joke.id}
          jokeId={joke.id}
          initialUpvotes={joke.upvotes} 
          initialDownvotes={joke.downvotes}
          disabled={muted}
          onVoteUpdate={onVoteUpdate ? (upvotes, downvotes) => onVoteUpdate(joke.id, upvotes, downvotes) : undefined}
        />
      </div>
    </div>
  );
}

function VoteButtons({ 
  jokeId,
  initialUpvotes, 
  initialDownvotes, 
  disabled,
  onVoteUpdate,
}: { 
  jokeId: number;
  initialUpvotes: number; 
  initialDownvotes: number; 
  disabled?: boolean;
  onVoteUpdate?: (upvotes: number, downvotes: number) => void;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load user's vote from localStorage (only runs once per component mount due to key prop)
  const [currentVote, setCurrentVote] = useState<VoteType>(() => getVoteForJoke(jokeId));
  
  // Track local vote counts
  const [localCounts, setLocalCounts] = useState({
    upvotes: initialUpvotes,
    downvotes: initialDownvotes
  });

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (disabled || isAnimating) return;

    // Clear any pending debounced API calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const previousVote = currentVote;
    let newVote: VoteType = voteType;
    let newUpvotes = localCounts.upvotes;
    let newDownvotes = localCounts.downvotes;

    // Calculate new vote state
    if (previousVote === voteType) {
      // Clicking the same button - undo the vote
      newVote = null;
      if (voteType === "upvote") {
        newUpvotes -= 1;
      } else {
        newDownvotes -= 1;
      }
    } else {
      // Switching votes or voting for the first time
      if (previousVote === "upvote") {
        newUpvotes -= 1;
      } else if (previousVote === "downvote") {
        newDownvotes -= 1;
      }
      
      if (voteType === "upvote") {
        newUpvotes += 1;
      } else {
        newDownvotes += 1;
      }
    }

    // Optimistic UI update
    setCurrentVote(newVote);
    setVoteForJoke(jokeId, newVote);
    setLocalCounts({ upvotes: newUpvotes, downvotes: newDownvotes });

    // Trigger scale animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    // Debounced API call
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/jokes/${jokeId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: newVote || "unvote",
            previousVote: previousVote,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Update the deck state with the confirmed vote counts from server
          if (onVoteUpdate && data.upvotes !== undefined && data.downvotes !== undefined) {
            onVoteUpdate(data.upvotes, data.downvotes);
          }
        } else {
          console.error("Failed to save vote to server");
        }
      } catch (error) {
        console.error("Error saving vote:", error);
      }
    }, 300); // 300ms debounce
  };

  const upvoteOpacity = currentVote === "upvote" ? "opacity-100" : "opacity-70";
  const downvoteOpacity = currentVote === "downvote" ? "opacity-100" : "opacity-70";

  return (
    <div className="flex items-center gap-12 select-none">
      <motion.button
        type="button"
        aria-label="Thumbs up"
        className={`flex items-center gap-3 text-white/90 transition-opacity hover:text-white disabled:pointer-events-none ${upvoteOpacity}`}
        disabled={disabled}
        onClick={() => handleVote("upvote")}
        animate={isAnimating && currentVote === "upvote" ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <FontAwesomeIcon 
          icon={faThumbsUp} 
          size="2x" 
          style={{ transform: "scaleX(-1)" }}
        />
        <span className="text-2xl font-bold">{localCounts.upvotes}</span>
      </motion.button>
      <motion.button
        type="button"
        aria-label="Thumbs down"
        className={`flex items-center gap-3 text-white/90 transition-opacity hover:text-white disabled:pointer-events-none ${downvoteOpacity}`}
        disabled={disabled}
        onClick={() => handleVote("downvote")}
        animate={isAnimating && currentVote === "downvote" ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <span className="text-2xl font-bold">{localCounts.downvotes}</span>
        <FontAwesomeIcon icon={faThumbsDown} size="2x" />
      </motion.button>
    </div>
  );
}
