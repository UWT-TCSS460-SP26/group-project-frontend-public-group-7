const PROFANITY_WORDS = [
  "ass",
  "asshole",
  "bastard",
  "bitch",
  "bullshit",
  "crap",
  "damn",
  "douche",
  "douchebag",
  "fag",
  "faggot",
  "fagg*t",
  "f*ggot",
  "fuck",
  "fucker",
  "fucking",
  "motherfucker",
  "nigga",
  "nigger",
  "paki",
  "piss",
  "poon",
  "queer",
  "retard",
  "spic",
  "tranny",
  "trannies",
  "tr*nny",
  "troon",
  "shit",
  "shitty",
  "shemale",
  "slut",
  "tard",
  "wetback",
  "whore",
] as const;

const profanityPattern = new RegExp(
  `\\b(${PROFANITY_WORDS.join("|")})\\b`,
  "gi",
);

function maskWord(word: string) {
  if (word.length <= 1) return word;
  return `${word[0]}${"*".repeat(word.length - 1)}`;
}

export function censorProfanity(text: string) {
  return text.replace(profanityPattern, (match) => maskWord(match));
}
