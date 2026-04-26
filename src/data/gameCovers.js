import { escapeSvg, formatName } from '../utils/format.js';

const COVER_BASE = 'https://archives.bulbagarden.net/wiki/Special:Redirect/file/';

const GAME_COVER_FILES = {
  red: 'Red_EN_boxart.png',
  blue: 'Blue_EN_boxart.png',
  yellow: 'Yellow_EN_boxart.png',
  gold: 'Gold_EN_boxart.png',
  silver: 'Silver_EN_boxart.png',
  crystal: 'Crystal_EN_boxart.png',
  ruby: 'Ruby_EN_boxart.png',
  sapphire: 'Sapphire_EN_boxart.png',
  emerald: 'Emerald_EN_boxart.jpg',
  firered: 'FireRed_EN_boxart.png',
  leafgreen: 'LeafGreen_EN_boxart.png',
  diamond: 'Diamond_EN_boxart.jpg',
  pearl: 'Pearl_EN_boxart.jpg',
  platinum: 'Platinum_EN_boxart.png',
  heartgold: 'HeartGold_EN_boxart.jpg',
  soulsilver: 'SoulSilver_EN_boxart.jpg',
  black: 'Black_EN_boxart.png',
  white: 'White_EN_boxart.png',
  colosseum: 'Colosseum_EN_boxart.png',
  xd: 'XD_EN_boxart.png',
  'black-2': 'Black_2_EN_boxart.png',
  'white-2': 'White_2_EN_boxart.png',
  x: 'X_EN_boxart.png',
  y: 'Y_EN_boxart.png',
  'omega-ruby': 'Omega_Ruby_EN_boxart.png',
  'alpha-sapphire': 'Alpha_Sapphire_EN_boxart.png',
  sun: 'Sun_EN_boxart.png',
  moon: 'Moon_EN_boxart.png',
  'ultra-sun': 'Ultra_Sun_EN_boxart.png',
  'ultra-moon': 'Ultra_Moon_EN_boxart.png',
  'lets-go-pikachu': 'Lets_Go_Pikachu_EN_boxart.png',
  'lets-go-eevee': 'Lets_Go_Eevee_EN_boxart.png',
  sword: 'Sword_EN_boxart.png',
  shield: 'Shield_EN_boxart.png',
  'brilliant-diamond': 'Brilliant_Diamond_EN_boxart.png',
  'shining-pearl': 'Shining_Pearl_EN_boxart.png',
  'legends-arceus': 'Legends_Arceus_EN_boxart.png',
  scarlet: 'Scarlet_EN_boxart.png',
  violet: 'Violet_EN_boxart.png',
  'the-isle-of-armor': 'The_Isle_of_Armor_logo.png',
  'the-crown-tundra': 'The_Crown_Tundra_logo.png',
  'legends-za': 'Pokémon_Legends_Z-A_logo.png',
  'mega-dimension': 'Mega_Dimension_Logo.png'
};

export function coverForGame(name) {
  const file = GAME_COVER_FILES[name];
  return file ? `${COVER_BASE}${encodeURIComponent(file)}` : fallbackCover(name);
}

export function fallbackCover(name) {
  const label = formatName(name);
  const hue = Math.abs([...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="hsl(${hue}, 78%, 46%)"/>
          <stop offset="1" stop-color="hsl(${(hue + 42) % 360}, 72%, 34%)"/>
        </linearGradient>
      </defs>
      <rect width="640" height="400" rx="28" fill="url(#g)"/>
      <circle cx="510" cy="96" r="54" fill="rgba(255,255,255,.18)"/>
      <circle cx="120" cy="292" r="76" fill="rgba(255,255,255,.12)"/>
      <rect x="70" y="72" width="500" height="256" rx="22" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.38)" stroke-width="3"/>
      <text x="320" y="188" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" text-anchor="middle">${escapeSvg(label)}</text>
      <text x="320" y="240" fill="rgba(255,255,255,.86)" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" text-anchor="middle">Pokémon</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
