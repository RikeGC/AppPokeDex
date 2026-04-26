const SPECIAL_NAMES = {
  'lets-go-pikachu': "Let's Go Pikachu",
  'lets-go-eevee': "Let's Go Eevee",
  'brilliant-diamond': 'Brilliant Diamond',
  'shining-pearl': 'Shining Pearl',
  firered: 'FireRed',
  leafgreen: 'LeafGreen',
  heartgold: 'HeartGold',
  soulsilver: 'SoulSilver',
  'ultra-sun': 'Ultra Sun',
  'ultra-moon': 'Ultra Moon',
  'omega-ruby': 'Omega Ruby',
  'alpha-sapphire': 'Alpha Sapphire',
  'the-isle-of-armor': 'The Isle of Armor',
  'the-crown-tundra': 'The Crown Tundra',
  'the-teal-mask': 'The Teal Mask',
  'the-indigo-disk': 'The Indigo Disk',
  'red-japan': 'Red Japan',
  'green-japan': 'Green Japan',
  'blue-japan': 'Blue Japan',
  'legends-za': 'Legends Z-A',
  'mega-dimension': 'Mega Dimension',
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z'
};

export function idFromUrl(url) {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

export function formatName(value) {
  if (!value) return '';
  if (SPECIAL_NAMES[value]) return SPECIAL_NAMES[value];
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export function spriteForSpecies(species) {
  const id = typeof species === 'number' ? species : idFromUrl(species.url);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function formatLocationName(value) {
  return formatName(value
    .replace(/-area$/, '')
    .replace(/-whole-area$/, '')
    .replace(/-inside$/, '')
    .replace(/-outside$/, ''));
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

export function escapeSvg(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
