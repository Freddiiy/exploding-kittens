export const OriginalCardsEnum = {
  EXPLODING_KITTEN: "Exploding Kitten",
  DEFUSE: "Defuse",
  ATTACK: "Attack",
  CAT_CARD: "Cat Card",
  FAVOR: "Favor",
  NOPE: "Nope",
  SEE_THE_FUTURE_3X: "See The Future 3x",
  SHUFFLE: "Shuffle",
  SKIP: "Skip",
} as const;

export const AllCardsTypes = {
  ...OriginalCardsEnum,
} as const;

export const CatCardsEnum = {
  BEARD_CAT: "Beard Cat",
  CATTERMELON: "Cattermelon",
  HAIRY_POTATO_CAT: "Hairy Potato Cat",
  RAINBOW_RALPHING_CAT: "Rainbow Ralphing Cat",
  TACO_CAT: "Taco Cat",
} as const;

export type CatCardEnum = (typeof CatCardsEnum)[keyof typeof CatCardsEnum];

export type KittenCardEnum = (typeof AllCardsTypes)[keyof typeof AllCardsTypes];
