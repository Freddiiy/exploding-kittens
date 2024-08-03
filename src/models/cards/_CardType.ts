export const OriginalCardsEnum = {
  EXPLODING_KITTEN: "Exploding Kitten",
  DEFUSE: "Defuse",
  ATTACK: "Attack",
  FAVOR: "Favor",
  NOPE: "Nope",
  SEE_THE_FUTURE: "See The Future",
  SHUFFLE: "Shuffle",
  SKIP: "Skip",
  BEARD_CAT: "Beard Cat",
  CATTERMELON: "Cattermelon",
  HAIRY_POTATO_CAT: "Hairy Potato Cat",
  RAINBOW_RALPHING_CAT: "Rainbow Ralphing Cat",
  TACO_CAT: "Taco Cat",
} as const;

export const CardType = {
  ...OriginalCardsEnum,
} as const;

export type CardType = (typeof CardType)[keyof typeof CardType];
