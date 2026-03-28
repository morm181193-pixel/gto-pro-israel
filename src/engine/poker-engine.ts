// ============================================================
// GTO Pro Israel — Poker Engine Core
// ============================================================
// Modules:
//   1. Card / Deck types & utilities
//   2. Hand Evaluator (7-card → best 5-card rank)
//   3. Monte Carlo Equity Calculator
//   4. Static Preflop Ranges (per position)
//   5. Rule-based Range Narrowing
// ============================================================

// ────────────────────────────────────────────
// 1. CARD & DECK
// ────────────────────────────────────────────

export type Suit = 'h' | 'd' | 'c' | 's';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
// 11=J, 12=Q, 13=K, 14=A

export interface Card {
  rank: Rank;
  suit: Suit;
}

const SUITS: Suit[] = ['h', 'd', 'c', 's'];
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/** Remove specific cards from a deck */
export function removeCards(deck: Card[], cards: Card[]): Card[] {
  return deck.filter(
    (d) => !cards.some((c) => c.rank === d.rank && c.suit === d.suit)
  );
}

/** Fisher-Yates shuffle (in-place, returns same array) */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Parse string like "Ah" "Td" "2c" into Card */
export function parseCard(s: string): Card {
  const rankMap: Record<string, Rank> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  const suitMap: Record<string, Suit> = {
    'h': 'h', 'd': 'd', 'c': 'c', 's': 's',
  };
  const rank = rankMap[s[0].toUpperCase()];
  const suit = suitMap[s[1].toLowerCase()];
  if (!rank || !suit) throw new Error(`Invalid card: ${s}`);
  return { rank, suit };
}

/** Card to display string */
export function cardToString(c: Card): string {
  const rankStr = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  return rankStr[c.rank] + c.suit;
}

// ────────────────────────────────────────────
// 2. HAND EVALUATOR
// ────────────────────────────────────────────
// Evaluates best 5-card hand from 7 cards.
// Returns a numeric score — higher is better.
// Score encoding: category (0-8) * 10^10 + tiebreakers
//
// Categories:
//   8 = Straight Flush
//   7 = Four of a Kind
//   6 = Full House
//   5 = Flush
//   4 = Straight
//   3 = Three of a Kind
//   2 = Two Pair
//   1 = One Pair
//   0 = High Card

const CATEGORY_MULTIPLIER = 10_000_000_000;

/** Get hand rank score for exactly 5 cards */
function evaluate5(cards: Card[]): number {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Check straight
  let isStraight = false;
  let straightHigh = 0;

  // Normal straight check
  if (ranks[0] - ranks[4] === 4 && new Set(ranks).size === 5) {
    isStraight = true;
    straightHigh = ranks[0];
  }
  // Ace-low straight (A-2-3-4-5)
  if (
    ranks[0] === 14 &&
    ranks[1] === 5 &&
    ranks[2] === 4 &&
    ranks[3] === 3 &&
    ranks[4] === 2
  ) {
    isStraight = true;
    straightHigh = 5; // 5-high straight
  }

  if (isStraight && isFlush) {
    return 8 * CATEGORY_MULTIPLIER + straightHigh;
  }

  // Count rank frequencies
  const freq: Map<number, number> = new Map();
  for (const r of ranks) {
    freq.set(r, (freq.get(r) || 0) + 1);
  }
  const groups = [...freq.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // by count desc
    return b[0] - a[0]; // by rank desc
  });

  const counts = groups.map((g) => g[1]);
  const groupRanks = groups.map((g) => g[0]);

  // Four of a kind
  if (counts[0] === 4) {
    return 7 * CATEGORY_MULTIPLIER + groupRanks[0] * 100 + groupRanks[1];
  }

  // Full house
  if (counts[0] === 3 && counts[1] === 2) {
    return 6 * CATEGORY_MULTIPLIER + groupRanks[0] * 100 + groupRanks[1];
  }

  // Flush
  if (isFlush) {
    return (
      5 * CATEGORY_MULTIPLIER +
      ranks[0] * 10000 +
      ranks[1] * 1000 +
      ranks[2] * 100 +
      ranks[3] * 10 +
      ranks[4]
    );
  }

  // Straight
  if (isStraight) {
    return 4 * CATEGORY_MULTIPLIER + straightHigh;
  }

  // Three of a kind
  if (counts[0] === 3) {
    return (
      3 * CATEGORY_MULTIPLIER +
      groupRanks[0] * 10000 +
      groupRanks[1] * 100 +
      groupRanks[2]
    );
  }

  // Two pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairHigh = Math.max(groupRanks[0], groupRanks[1]);
    const pairLow = Math.min(groupRanks[0], groupRanks[1]);
    return (
      2 * CATEGORY_MULTIPLIER + pairHigh * 10000 + pairLow * 100 + groupRanks[2]
    );
  }

  // One pair
  if (counts[0] === 2) {
    return (
      1 * CATEGORY_MULTIPLIER +
      groupRanks[0] * 1000000 +
      groupRanks[1] * 10000 +
      groupRanks[2] * 100 +
      groupRanks[3]
    );
  }

  // High card
  return (
    0 * CATEGORY_MULTIPLIER +
    ranks[0] * 10000 +
    ranks[1] * 1000 +
    ranks[2] * 100 +
    ranks[3] * 10 +
    ranks[4]
  );
}

/** Generate all 5-card combinations from 7 cards */
function combinations5of7(cards: Card[]): Card[][] {
  const result: Card[][] = [];
  for (let i = 0; i < 7; i++) {
    for (let j = i + 1; j < 7; j++) {
      // Exclude cards at index i and j
      const hand = cards.filter((_, idx) => idx !== i && idx !== j);
      result.push(hand);
    }
  }
  return result;
}

/** Evaluate best 5-card hand from 5, 6, or 7 cards */
export function evaluateHand(cards: Card[]): number {
  if (cards.length === 5) return evaluate5(cards);

  if (cards.length === 6) {
    let best = 0;
    for (let i = 0; i < 6; i++) {
      const hand = cards.filter((_, idx) => idx !== i);
      best = Math.max(best, evaluate5(hand));
    }
    return best;
  }

  if (cards.length === 7) {
    let best = 0;
    for (const combo of combinations5of7(cards)) {
      best = Math.max(best, evaluate5(combo));
    }
    return best;
  }

  throw new Error(`Cannot evaluate ${cards.length} cards`);
}

/** Get hand category name from score */
export function getHandCategory(score: number): string {
  const categories = [
    'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
    'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush',
  ];
  const cat = Math.floor(score / CATEGORY_MULTIPLIER);
  return categories[cat] || 'Unknown';
}

// ────────────────────────────────────────────
// 3. MONTE CARLO EQUITY CALCULATOR
// ────────────────────────────────────────────

export interface EquityResult {
  /** Equity as 0-1 for each player */
  equities: number[];
  /** Win count per player */
  wins: number[];
  /** Tie count per player */
  ties: number[];
  /** Total simulations run */
  simulations: number;
  /** Time in ms */
  timeMs: number;
}

export interface PlayerHand {
  cards: Card[]; // 2 hole cards, or empty for unknown
}

/**
 * Monte Carlo equity calculation.
 *
 * @param players - Array of players with their hole cards (empty = random)
 * @param board - Community cards (0-5)
 * @param numSimulations - Number of MC iterations (default 20000)
 */
export function calculateEquity(
  players: PlayerHand[],
  board: Card[],
  numSimulations: number = 20000
): EquityResult {
  const start = performance.now();
  const numPlayers = players.length;

  const wins = new Array(numPlayers).fill(0);
  const ties = new Array(numPlayers).fill(0);

  // Cards that are known (on board + in known hands)
  const knownCards: Card[] = [...board];
  const knownPlayerIndices: number[] = [];
  const unknownPlayerIndices: number[] = [];

  players.forEach((p, i) => {
    if (p.cards.length === 2) {
      knownCards.push(...p.cards);
      knownPlayerIndices.push(i);
    } else {
      unknownPlayerIndices.push(i);
    }
  });

  const cardsNeededOnBoard = 5 - board.length;

  for (let sim = 0; sim < numSimulations; sim++) {
    // Create remaining deck and shuffle
    const remaining = shuffle(removeCards(createDeck(), knownCards));
    let dealIdx = 0;

    // Deal cards to unknown players
    const simHands: Card[][] = players.map((p, i) => {
      if (p.cards.length === 2) return p.cards;
      const hand = [remaining[dealIdx], remaining[dealIdx + 1]];
      dealIdx += 2;
      return hand;
    });

    // Complete the board
    const simBoard = [...board];
    for (let i = 0; i < cardsNeededOnBoard; i++) {
      simBoard.push(remaining[dealIdx]);
      dealIdx++;
    }

    // Evaluate each player's hand
    const scores = simHands.map((hand) =>
      evaluateHand([...hand, ...simBoard])
    );

    // Find winner(s)
    const maxScore = Math.max(...scores);
    const winners = scores.reduce<number[]>((acc, s, i) => {
      if (s === maxScore) acc.push(i);
      return acc;
    }, []);

    if (winners.length === 1) {
      wins[winners[0]]++;
    } else {
      // Split pot (tie)
      for (const w of winners) {
        ties[w]++;
      }
    }
  }

  const equities = players.map((_, i) => {
    return (wins[i] + ties[i] / 2) / numSimulations;
  });

  return {
    equities,
    wins,
    ties,
    simulations: numSimulations,
    timeMs: Math.round(performance.now() - start),
  };
}

// ────────────────────────────────────────────
// 4. PREFLOP RANGES (Static, per position)
// ────────────────────────────────────────────
// Ranges represented as arrays of hand combos like "AKs", "QJo", "TT"
// s = suited, o = offsuit, no suffix = pocket pair
//
// Based on standard 100BB 9-max open-raise ranges (GTO approximation)

export type HandCombo = string; // e.g. "AKs", "QJo", "TT"

export const PREFLOP_OPEN_RANGES: Record<string, HandCombo[]> = {
  // UTG: ~15% of hands
  UTG: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77',
    'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s',
    'KQs', 'KJs', 'KTs',
    'QJs', 'QTs',
    'JTs',
    'T9s',
    '98s',
    'AKo', 'AQo',
  ],

  // UTG+1: ~17%
  'UTG+1': [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s', 'A3s',
    'KQs', 'KJs', 'KTs',
    'QJs', 'QTs',
    'JTs', 'J9s',
    'T9s',
    '98s',
    '87s',
    'AKo', 'AQo', 'AJo',
  ],

  // UTG+2: ~19%
  'UTG+2': [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s',
    'QJs', 'QTs', 'Q9s',
    'JTs', 'J9s',
    'T9s', 'T8s',
    '98s',
    '87s',
    '76s',
    'AKo', 'AQo', 'AJo',
  ],

  // MP / MP+1: ~22%
  MP: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s',
    'QJs', 'QTs', 'Q9s',
    'JTs', 'J9s', 'J8s',
    'T9s', 'T8s',
    '98s', '97s',
    '87s',
    '76s',
    '65s',
    'AKo', 'AQo', 'AJo', 'ATo',
    'KQo',
  ],

  'MP+1': [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s',
    'QJs', 'QTs', 'Q9s',
    'JTs', 'J9s', 'J8s',
    'T9s', 'T8s',
    '98s', '97s',
    '87s',
    '76s',
    '65s',
    'AKo', 'AQo', 'AJo', 'ATo',
    'KQo',
  ],

  // CO: ~27%
  CO: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s',
    'QJs', 'QTs', 'Q9s', 'Q8s',
    'JTs', 'J9s', 'J8s',
    'T9s', 'T8s', 'T7s',
    '98s', '97s',
    '87s', '86s',
    '76s', '75s',
    '65s', '64s',
    '54s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
    'KQo', 'KJo',
    'QJo',
  ],

  // BTN: ~40%
  BTN: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s',
    'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s',
    'JTs', 'J9s', 'J8s', 'J7s',
    'T9s', 'T8s', 'T7s', 'T6s',
    '98s', '97s', '96s',
    '87s', '86s', '85s',
    '76s', '75s',
    '65s', '64s',
    '54s', '53s',
    '43s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o',
    'KQo', 'KJo', 'KTo', 'K9o',
    'QJo', 'QTo',
    'JTo', 'J9o',
    'T9o',
  ],

  // SB: ~35% (open-raise or limp depending on strategy; this is RFI range)
  SB: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s',
    'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s',
    'JTs', 'J9s', 'J8s', 'J7s',
    'T9s', 'T8s', 'T7s',
    '98s', '97s', '96s',
    '87s', '86s',
    '76s', '75s',
    '65s', '64s',
    '54s', '53s',
    '43s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o',
    'KQo', 'KJo', 'KTo',
    'QJo', 'QTo',
    'JTo',
  ],

  // BB: defense range vs open (calling range, not opening)
  BB: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
    'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s',
    'JTs', 'J9s', 'J8s', 'J7s', 'J6s',
    'T9s', 'T8s', 'T7s', 'T6s',
    '98s', '97s', '96s', '95s',
    '87s', '86s', '85s',
    '76s', '75s', '74s',
    '65s', '64s', '63s',
    '54s', '53s', '52s',
    '43s', '42s',
    '32s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
    'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o',
    'QJo', 'QTo', 'Q9o', 'Q8o',
    'JTo', 'J9o', 'J8o',
    'T9o', 'T8o',
    '98o', '97o',
    '87o',
    '76o',
  ],
};

// ────────────────────────────────────────────
// 5. RANGE UTILITIES
// ────────────────────────────────────────────

/**
 * Expand a hand combo string into actual card pairs.
 * E.g. "AKs" → [Ah Kh, Ad Kd, Ac Kc, As Ks]
 *      "AKo" → [Ah Kd, Ah Kc, Ah Ks, Ad Kh, ...]
 *      "TT"  → [Th Td, Th Tc, Th Ts, Td Tc, Td Ts, Tc Ts]
 */
export function expandCombo(combo: HandCombo): [Card, Card][] {
  const rankMap: Record<string, Rank> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };

  const r1 = rankMap[combo[0]];
  const r2 = rankMap[combo[1]];
  const type = combo[2]; // 's', 'o', or undefined (pair)

  if (!r1 || !r2) throw new Error(`Invalid combo: ${combo}`);

  const results: [Card, Card][] = [];

  if (r1 === r2) {
    // Pocket pair — all 6 combinations
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        results.push([
          { rank: r1, suit: SUITS[i] },
          { rank: r2, suit: SUITS[j] },
        ]);
      }
    }
  } else if (type === 's') {
    // Suited — 4 combos
    for (const suit of SUITS) {
      results.push([
        { rank: r1, suit },
        { rank: r2, suit },
      ]);
    }
  } else {
    // Offsuit — 12 combos
    for (const s1 of SUITS) {
      for (const s2 of SUITS) {
        if (s1 !== s2) {
          results.push([
            { rank: r1, suit: s1 },
            { rank: r2, suit: s2 },
          ]);
        }
      }
    }
  }

  return results;
}

/**
 * Expand a full range (array of combos) into all possible card pairs,
 * removing pairs that conflict with known cards (board + hero hand).
 */
export function expandRange(
  range: HandCombo[],
  deadCards: Card[]
): [Card, Card][] {
  const allPairs: [Card, Card][] = [];

  for (const combo of range) {
    const expanded = expandCombo(combo);
    for (const pair of expanded) {
      // Check no card in pair is a dead card
      const conflict = pair.some((pc) =>
        deadCards.some((dc) => dc.rank === pc.rank && dc.suit === pc.suit)
      );
      if (!conflict) {
        allPairs.push(pair);
      }
    }
  }

  return allPairs;
}

// ────────────────────────────────────────────
// 6. RULE-BASED RANGE NARROWING
// ────────────────────────────────────────────

export type Action = 'fold' | 'call' | 'raise' | '3bet' | '4bet' | 'allin';

/**
 * Narrow a preflop range based on opponent's action.
 * This is a simplified heuristic — not solver-accurate,
 * but ~85-90% useful for low-mid stakes.
 */
export function narrowRangeByAction(
  range: HandCombo[],
  action: Action
): HandCombo[] {
  // Tier definitions for range narrowing
  const premiumHands = ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'];
  const strongHands = [
    'TT', '99', 'AQs', 'AQo', 'AJs', 'ATs', 'KQs',
  ];
  const mediumHands = [
    '88', '77', '66', 'A9s', 'A8s', 'A7s', 'A5s', 'A4s',
    'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s',
    'AJo', 'ATo', 'KQo',
  ];

  switch (action) {
    case 'fold':
      return []; // No range — player folded

    case 'call':
      // Remove the very top (would 3-bet) and very bottom (would fold)
      // Keep medium-strong hands
      return range.filter(
        (h) =>
          !premiumHands.includes(h) || 
          // Some premiums stay in call range (trapping)
          Math.random() < 0.15
      );

    case 'raise':
      // Keep top ~60% of the original range
      return range.filter(
        (h) =>
          premiumHands.includes(h) ||
          strongHands.includes(h) ||
          mediumHands.includes(h)
      );

    case '3bet':
      // Only premium + some bluffs
      return range.filter(
        (h) =>
          premiumHands.includes(h) ||
          strongHands.includes(h) ||
          // Some suited bluffs
          ['A5s', 'A4s', '76s', '65s', '54s'].includes(h)
      );

    case '4bet':
      // Very tight — premiums + AKo + occasional bluffs
      return range.filter(
        (h) =>
          premiumHands.includes(h) ||
          ['AQs', 'AQo'].includes(h) ||
          // Rare bluff combos
          (['A5s'].includes(h) && Math.random() < 0.3)
      );

    case 'allin':
      // Only the nuts
      return range.filter((h) =>
        ['AA', 'KK', 'QQ', 'AKs', 'AKo'].includes(h)
      );

    default:
      return range;
  }
}

// ────────────────────────────────────────────
// 7. HIGH-LEVEL API
// ────────────────────────────────────────────

export interface TableSetup {
  heroPosition: string;
  heroCards: Card[];
  board: Card[];
  opponents: {
    position: string;
    action: Action;
  }[];
  numSimulations?: number;
}

export interface AnalysisResult {
  heroEquity: number;
  opponentEquities: { position: string; equity: number }[];
  potOdds?: number;
  recommendation: 'fold' | 'call' | 'raise';
  confidence: number; // 0-1
  simulations: number;
  timeMs: number;
}

/**
 * Main analysis function — takes table setup, returns strategic recommendation.
 */
export function analyzeSpot(setup: TableSetup): AnalysisResult {
  const {
    heroPosition,
    heroCards,
    board,
    opponents,
    numSimulations = 20000,
  } = setup;

  // Build player hands array
  // Hero is always player 0
  const players: PlayerHand[] = [{ cards: heroCards }];

  // For each opponent, sample a hand from their narrowed range
  const deadCards = [...heroCards, ...board];

  // Run multiple equity calculations and average
  const totalEquities: number[] = new Array(opponents.length + 1).fill(0);
  const numTrials = 5; // Average over 5 range samples for stability

  for (let trial = 0; trial < numTrials; trial++) {
    const trialPlayers: PlayerHand[] = [{ cards: heroCards }];

    for (const opp of opponents) {
      if (opp.action === 'fold') continue; // Skip folded players

      const baseRange = PREFLOP_OPEN_RANGES[opp.position] || PREFLOP_OPEN_RANGES['MP'];
      const narrowedRange = narrowRangeByAction(baseRange, opp.action);
      const possibleHands = expandRange(narrowedRange, deadCards);

      if (possibleHands.length > 0) {
        // Pick a random hand from the range
        const randomHand = possibleHands[Math.floor(Math.random() * possibleHands.length)];
        trialPlayers.push({ cards: randomHand });
      } else {
        trialPlayers.push({ cards: [] }); // Random hand
      }
    }

    const result = calculateEquity(
      trialPlayers,
      board,
      Math.floor(numSimulations / numTrials)
    );

    result.equities.forEach((eq, i) => {
      totalEquities[i] += eq;
    });
  }

  // Average equities
  const avgEquities = totalEquities.map((e) => e / numTrials);
  const heroEquity = avgEquities[0];

  // Generate recommendation based on equity
  let recommendation: 'fold' | 'call' | 'raise';
  let confidence: number;

  const activeOpponents = opponents.filter((o) => o.action !== 'fold').length;
  const potOdds = 1 / (activeOpponents + 1); // Simplified pot odds

  if (heroEquity > potOdds + 0.15) {
    recommendation = 'raise';
    confidence = Math.min(1, (heroEquity - potOdds) / 0.5);
  } else if (heroEquity > potOdds - 0.05) {
    recommendation = 'call';
    confidence = Math.min(1, (heroEquity - potOdds + 0.1) / 0.3);
  } else {
    recommendation = 'fold';
    confidence = Math.min(1, (potOdds - heroEquity) / 0.3);
  }

  // Build opponent equities
  const oppEquities = opponents
    .filter((o) => o.action !== 'fold')
    .map((opp, i) => ({
      position: opp.position,
      equity: avgEquities[i + 1] || 0,
    }));

  return {
    heroEquity,
    opponentEquities: oppEquities,
    potOdds,
    recommendation,
    confidence: Math.round(confidence * 100) / 100,
    simulations: numSimulations,
    timeMs: 0, // Filled by caller
  };
}

// ────────────────────────────────────────────
// 8. BOARD TEXTURE ANALYSIS
// ────────────────────────────────────────────

export interface BoardTexture {
  flushPossible: boolean;     // 3+ cards of same suit
  flushDraw: boolean;         // exactly 2 of same suit (draw possible)
  flushSuit: Suit | null;     // dominant suit if flushPossible
  straightPossible: boolean;  // 3+ connected ranks
  pairedBoard: boolean;       // board has a pair
  tripsBoard: boolean;        // board has trips
  highCard: Rank;             // highest board card
  wetness: number;            // 0-1 how coordinated the board is
}

export function analyzeBoardTexture(board: Card[]): BoardTexture {
  if (board.length === 0) {
    return {
      flushPossible: false, flushDraw: false, flushSuit: null,
      straightPossible: false, pairedBoard: false, tripsBoard: false,
      highCard: 2 as Rank, wetness: 0,
    };
  }

  // Suit counts
  const suitCounts: Record<string, number> = { h: 0, d: 0, c: 0, s: 0 };
  for (const c of board) suitCounts[c.suit]++;
  const maxSuitCount = Math.max(...Object.values(suitCounts));
  const flushSuitEntry = Object.entries(suitCounts).find(([, v]) => v === maxSuitCount);
  const flushPossible = maxSuitCount >= 3;
  const flushDraw = maxSuitCount === 2 && board.length <= 4;

  // Rank analysis
  const ranks = board.map((c) => c.rank).sort((a, b) => a - b);
  const uniqueRanks = [...new Set(ranks)];
  const highCard = ranks[ranks.length - 1];

  // Paired / trips
  const rankCounts: Map<number, number> = new Map();
  for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) || 0) + 1);
  const maxRankCount = Math.max(...rankCounts.values());
  const pairedBoard = maxRankCount >= 2;
  const tripsBoard = maxRankCount >= 3;

  // Straight possible: check if 3+ ranks are within a 5-card window
  let straightPossible = false;
  if (uniqueRanks.length >= 3) {
    // Include ace-low: add rank 1 if ace present
    const extRanks = uniqueRanks.includes(14) ? [1, ...uniqueRanks] : [...uniqueRanks];
    for (let i = 0; i <= extRanks.length - 3; i++) {
      if (extRanks[i + 2] - extRanks[i] <= 4) {
        straightPossible = true;
        break;
      }
    }
  }

  // Wetness score: combination of draws + connectivity
  let wetness = 0;
  if (flushPossible) wetness += 0.35;
  else if (flushDraw) wetness += 0.15;
  if (straightPossible) wetness += 0.3;
  if (pairedBoard) wetness -= 0.1; // paired boards are drier
  // Connectedness bonus: how close adjacent board ranks are
  for (let i = 1; i < uniqueRanks.length; i++) {
    if (uniqueRanks[i] - uniqueRanks[i - 1] <= 2) wetness += 0.1;
  }
  wetness = Math.max(0, Math.min(1, wetness));

  return {
    flushPossible,
    flushDraw,
    flushSuit: flushPossible ? (flushSuitEntry![0] as Suit) : null,
    straightPossible,
    pairedBoard,
    tripsBoard,
    highCard,
    wetness,
  };
}

// ────────────────────────────────────────────
// 9. POSTFLOP RANGE NARROWING
// ────────────────────────────────────────────

/**
 * Narrow a range by board texture.
 * Removes hands that would realistically have folded by this street.
 * Only ADDS filtering — never modifies existing functions.
 */
export function narrowRangeByBoard(
  combos: HandCombo[],
  board: Card[]
): HandCombo[] {
  if (board.length === 0) return combos; // preflop — no narrowing

  const texture = analyzeBoardTexture(board);
  const street = board.length <= 3 ? 'flop' : board.length === 4 ? 'turn' : 'river';

  return combos.filter((combo) => {
    const rank1Str = combo[0];
    const rank2Str = combo[1];
    const type = combo[2] as 's' | 'o' | undefined; // suited, offsuit, or pair
    const rankMap: Record<string, Rank> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
      '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
    };
    const r1 = rankMap[rank1Str];
    const r2 = rankMap[rank2Str];
    if (!r1 || !r2) return true; // safety

    const isPair = r1 === r2;
    const boardRanks = board.map((c) => c.rank);
    const hiRank = Math.max(r1, r2);
    const loRank = Math.min(r1, r2);

    // Does this hand connect with the board?
    const hitsTopPair = boardRanks.includes(hiRank) && hiRank === texture.highCard;
    const hitsPair = boardRanks.includes(r1) || boardRanks.includes(r2);
    const hitsOverpair = isPair && r1 > texture.highCard;
    const hitsSet = isPair && boardRanks.includes(r1);

    // Flush connectivity
    const isSuited = type === 's';
    const hasFlushDraw = isSuited && texture.flushDraw;
    const hasMadeFlush = isSuited && texture.flushPossible;

    // Straight connectivity: hand ranks close to board ranks
    const allRanks = [...boardRanks, r1, r2].sort((a, b) => a - b);
    const uniqueAll = [...new Set(allRanks)];
    let hasStraightDraw = false;
    let hasMadeStraight = false;
    // Check 5-card windows for 4+ unique ranks (draw) or 5 (made)
    const extAll = uniqueAll.includes(14) ? [1, ...uniqueAll] : [...uniqueAll];
    for (let i = 0; i <= extAll.length - 4; i++) {
      const window = extAll[i + 3] - extAll[i];
      if (window <= 4) {
        // Check that hero cards contribute to this window
        const windowRanks = extAll.slice(i, i + 4);
        const heroContributes = windowRanks.includes(r1) || windowRanks.includes(r2)
          || (r1 === 14 && windowRanks.includes(1)) || (r2 === 14 && windowRanks.includes(1));
        if (heroContributes) {
          hasStraightDraw = true;
          // Check for 5 in a row
          if (i + 4 < extAll.length && extAll[i + 4] - extAll[i] <= 4) {
            hasMadeStraight = true;
          }
        }
      }
    }

    const hasAnything = hitsPair || hitsOverpair || hitsSet || hasFlushDraw || hasMadeFlush || hasStraightDraw || hasMadeStraight;
    const hasStrong = hitsTopPair || hitsOverpair || hitsSet || hasMadeFlush || hasMadeStraight;

    // Street-based filtering thresholds
    switch (street) {
      case 'flop':
        // Keep anything that connected, plus overcards (A/K high)
        if (hasAnything) return true;
        if (hiRank >= 13) return true; // AK+ overcards might continue
        return false;

      case 'turn':
        // Tighter: need pair+ or strong draw
        if (hasStrong) return true;
        if (hitsPair && hiRank >= 10) return true; // mid pair+ stays
        if (hasFlushDraw || hasStraightDraw) return true; // draws stay
        if (hitsOverpair) return true;
        return false;

      case 'river':
        // Tightest: need made hand
        if (hasStrong) return true;
        if (hitsPair && hiRank >= 10) return true;
        // No more draws on river — only made hands
        return false;
    }
  });
}

// ────────────────────────────────────────────
// 10. ENHANCED ANALYSIS (board-texture-aware)
// ────────────────────────────────────────────

export interface EnhancedAnalysisResult extends AnalysisResult {
  boardTexture: BoardTexture;
  /** Opponent range categories for UI display */
  opponentRangeBreakdown: {
    position: string;
    categories: {
      label: string;
      hebrewLabel: string;
      percentage: number;
      combos: number;
      color: string;
    }[];
    totalCombos: number;
  }[];
}

/**
 * Categorize an opponent's narrowed range into value/marginal/draws/air.
 */
function categorizeRange(
  combos: HandCombo[],
  board: Card[]
): { label: string; hebrewLabel: string; percentage: number; combos: number; color: string }[] {
  if (combos.length === 0) return [];

  const texture = analyzeBoardTexture(board);
  const boardRanks = board.map((c) => c.rank);
  const rankMap: Record<string, Rank> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };

  let value = 0, marginal = 0, draws = 0, air = 0;

  for (const combo of combos) {
    const r1 = rankMap[combo[0]];
    const r2 = rankMap[combo[1]];
    if (!r1 || !r2) { air++; continue; }

    const isPair = r1 === r2;
    const hiRank = Math.max(r1, r2);
    const type = combo[2] as 's' | 'o' | undefined;

    const hitsTopPair = boardRanks.includes(hiRank) && hiRank === texture.highCard;
    const hitsPair = boardRanks.includes(r1) || boardRanks.includes(r2);
    const hitsOverpair = isPair && r1 > texture.highCard;
    const hitsSet = isPair && boardRanks.includes(r1);
    const hasMadeFlush = type === 's' && texture.flushPossible;
    const hasFlushDraw = type === 's' && texture.flushDraw;

    if (hitsSet || hasMadeFlush || (hitsOverpair && isPair)) {
      value++;
    } else if (hitsTopPair || (hitsPair && hiRank >= 10)) {
      marginal++;
    } else if (hasFlushDraw || (hitsPair && hiRank < 10)) {
      draws++;
    } else {
      air++;
    }
  }

  const total = combos.length;
  const cats = [];
  if (value > 0) cats.push({ label: 'Value', hebrewLabel: 'ערך', percentage: (value / total) * 100, combos: value, color: '#00f4fe' });
  if (marginal > 0) cats.push({ label: 'Marginal', hebrewLabel: 'שוליים', percentage: (marginal / total) * 100, combos: marginal, color: '#de8eff' });
  if (draws > 0) cats.push({ label: 'Draws', hebrewLabel: 'דראו', percentage: (draws / total) * 100, combos: draws, color: '#ff6e81' });
  if (air > 0) cats.push({ label: 'Air', hebrewLabel: 'אוויר', percentage: (air / total) * 100, combos: air, color: '#72757d' });
  return cats;
}

/**
 * Enhanced analysis with board texture awareness.
 * Does NOT modify analyzeSpot — wraps it with additional logic.
 */
export function analyzeSpotEnhanced(setup: TableSetup): EnhancedAnalysisResult {
  const { heroCards, board, opponents } = setup;
  const texture = analyzeBoardTexture(board);
  const deadCards = [...heroCards, ...board];

  // For postflop: narrow opponent ranges by board texture
  const enhancedSetup: TableSetup = { ...setup };

  // Run base analysis (uses original analyzeSpot internally re-implemented here
  // to apply board narrowing without modifying the original function)
  const numSimulations = setup.numSimulations || 20000;
  const numTrials = 5;
  const totalEquities: number[] = new Array(opponents.length + 1).fill(0);

  // Collect range breakdowns
  const rangeBreakdowns: EnhancedAnalysisResult['opponentRangeBreakdown'] = [];

  for (const opp of opponents) {
    if (opp.action === 'fold') continue;
    const baseRange = PREFLOP_OPEN_RANGES[opp.position] || PREFLOP_OPEN_RANGES['MP'];
    const actionNarrowed = narrowRangeByAction(baseRange, opp.action);
    const boardNarrowed = board.length > 0
      ? narrowRangeByBoard(actionNarrowed, board)
      : actionNarrowed;
    const finalRange = boardNarrowed.length > 0 ? boardNarrowed : actionNarrowed;
    const categories = board.length > 0
      ? categorizeRange(finalRange, board)
      : [{ label: 'Range', hebrewLabel: 'טווח פריפלופ', percentage: 100, combos: finalRange.length, color: '#de8eff' }];
    rangeBreakdowns.push({
      position: opp.position,
      categories,
      totalCombos: finalRange.length,
    });
  }

  for (let trial = 0; trial < numTrials; trial++) {
    const trialPlayers: PlayerHand[] = [{ cards: heroCards }];

    for (const opp of opponents) {
      if (opp.action === 'fold') continue;
      const baseRange = PREFLOP_OPEN_RANGES[opp.position] || PREFLOP_OPEN_RANGES['MP'];
      const actionNarrowed = narrowRangeByAction(baseRange, opp.action);
      const boardNarrowed = board.length > 0
        ? narrowRangeByBoard(actionNarrowed, board)
        : actionNarrowed;
      const finalRange = boardNarrowed.length > 0 ? boardNarrowed : actionNarrowed;
      const possibleHands = expandRange(finalRange, deadCards);

      if (possibleHands.length > 0) {
        const randomHand = possibleHands[Math.floor(Math.random() * possibleHands.length)];
        trialPlayers.push({ cards: randomHand });
      } else {
        trialPlayers.push({ cards: [] });
      }
    }

    const result = calculateEquity(
      trialPlayers,
      board,
      Math.floor(numSimulations / numTrials)
    );

    result.equities.forEach((eq, i) => {
      totalEquities[i] += eq;
    });
  }

  const avgEquities = totalEquities.map((e) => e / numTrials);
  const heroEquity = avgEquities[0];

  const activeOpponents = opponents.filter((o) => o.action !== 'fold').length;
  const potOdds = 1 / (activeOpponents + 1);

  // Board-texture-aware recommendation
  let recommendation: 'fold' | 'call' | 'raise';
  let confidence: number;

  if (heroEquity > potOdds + 0.15) {
    recommendation = 'raise';
    confidence = Math.min(1, (heroEquity - potOdds) / 0.5);
  } else if (heroEquity > potOdds - 0.05) {
    recommendation = 'call';
    confidence = Math.min(1, (heroEquity - potOdds + 0.1) / 0.3);
  } else {
    recommendation = 'fold';
    confidence = Math.min(1, (potOdds - heroEquity) / 0.3);
  }

  // Board texture adjustments to confidence & recommendation
  if (board.length > 0) {
    // Check if hero has flush protection
    const heroSuits = heroCards.map((c) => c.suit);
    const hasFlushCard = texture.flushSuit ? heroSuits.includes(texture.flushSuit) : false;

    if (texture.flushPossible && !hasFlushCard) {
      // Flush possible but hero can't make flush — reduce confidence, lean toward caution
      confidence *= 0.65;
      if (recommendation === 'raise') recommendation = 'call';
    }

    if (texture.straightPossible) {
      confidence *= 0.85;
    }

    // Multiway + wet board = extra caution
    if (activeOpponents >= 2 && texture.wetness >= 0.4) {
      confidence *= 0.7;
      if (recommendation === 'raise') recommendation = 'call';
    }
  }

  confidence = Math.round(Math.max(0, Math.min(1, confidence)) * 100) / 100;

  const oppEquities = opponents
    .filter((o) => o.action !== 'fold')
    .map((opp, i) => ({
      position: opp.position,
      equity: avgEquities[i + 1] || 0,
    }));

  return {
    heroEquity,
    opponentEquities: oppEquities,
    potOdds,
    recommendation,
    confidence,
    simulations: numSimulations,
    timeMs: 0,
    boardTexture: texture,
    opponentRangeBreakdown: rangeBreakdowns,
  };
}
