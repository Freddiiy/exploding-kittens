interface ExplodingKittenCharacter {
  characterId: number;
  name: string;
  img: string;
}

export const explodingKittenCharacters: ExplodingKittenCharacter[] = [
  { characterId: 1, name: "God Cat", img: "/characters/god_cat.png" },
  {
    characterId: 2,
    name: "Angry Devil Cat",
    img: "/characters/angry_devil_cat.png",
  },
  { characterId: 3, name: "Marv Higgins", img: "/characters/marv_higgins.png" },
  {
    characterId: 4,
    name: "Travis Higgins",
    img: "/characters/travis_higgins.png",
  },
];
