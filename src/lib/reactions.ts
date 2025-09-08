// Utility functions for handling reaction emoticons

export const REACTION_EMOJIS = {
  love: '❤️',
  cry: '😢',
  angry: '😡'
} as const;

export const API_REACTION_MAP = {
  love: '❤️',
  cry: '😢',
  angry: '😡'
} as const;

export type ReactionType = keyof typeof REACTION_EMOJIS;

/**
 * Get the emoji for a reaction type
 */
export function getReactionEmoji(reaction: string): string {
  return REACTION_EMOJIS[reaction as ReactionType] || '❤️';
}

/**
 * Get the API format emoji for a reaction type
 */
export function getApiReaction(reaction: string): '❤️' | '😢' | '😡' {
  return API_REACTION_MAP[reaction as ReactionType] || '❤️';
}

/**
 * Reaction definitions for forms and UI
 */
export const EMOTION_REACTIONS = [
  { id: 'love', name: 'Prefer', emoji: '❤️' },
  { id: 'cry', name: 'Dislike', emoji: '😢' },
  { id: 'angry', name: 'Vote delete', emoji: '😡' },
] as const;