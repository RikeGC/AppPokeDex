import { apiGet } from '../api/pokeapi.js';
import { formatName, idFromUrl } from './format.js';

export async function loadNationalDexUntilGeneration(versionGroup) {
  if (!versionGroup || !versionGroup.generation) {
    throw new Error('Não foi possível identificar a geração desse jogo.');
  }

  const generationId = idFromUrl(versionGroup.generation.url);
  const generations = await Promise.all(
    Array.from({ length: generationId }, (_, index) => apiGet(`/generation/${index + 1}`))
  );
  const speciesByName = new Map();

  generations.forEach((generation) => {
    generation.pokemon_species.forEach((species) => {
      const id = idFromUrl(species.url);
      speciesByName.set(species.name, {
        id,
        name: species.name,
        label: formatName(species.name),
        entryNumber: id,
        speciesUrl: species.url
      });
    });
  });

  return Array.from(speciesByName.values()).sort((a, b) => a.id - b.id);
}

export function extractMovesForVersionGroup(moves, groupName) {
  return moves.flatMap((entry) => entry.version_group_details
    .filter((detail) => detail.version_group.name === groupName)
    .map((detail) => ({
      name: entry.move.name,
      method: detail.move_learn_method.name,
      level: detail.level_learned_at
    })))
    .sort((a, b) => a.method.localeCompare(b.method) || a.level - b.level || a.name.localeCompare(b.name));
}

export function extractEncountersForVersion(encounters, versionName) {
  return encounters.map((area) => {
    const versionDetails = area.version_details.filter((detail) => detail.version.name === versionName);
    if (versionDetails.length === 0) return null;

    const methods = new Set();
    let maxChance = 0;

    versionDetails.forEach((versionDetail) => {
      maxChance = Math.max(maxChance, versionDetail.max_chance || 0);
      versionDetail.encounter_details.forEach((detail) => {
        const method = formatName(detail.method.name);
        const levels = detail.min_level === detail.max_level
          ? `Nv. ${detail.min_level}`
          : `Nv. ${detail.min_level}-${detail.max_level}`;
        const chance = detail.chance ? `${detail.chance}%` : '';
        methods.add([method, levels, chance].filter(Boolean).join(' · '));
      });
    });

    return {
      location: area.location_area.name,
      maxChance,
      methods: Array.from(methods)
    };
  }).filter(Boolean).sort((a, b) => a.location.localeCompare(b.location));
}

export function groupMovesByMethod(moves) {
  return moves.reduce((groups, move) => {
    if (move.method === 'level-up') {
      groups.levelUp.push(move);
    } else if (['machine', 'tm', 'hm', 'tr'].includes(move.method)) {
      groups.machine.push(move);
    } else {
      groups.other.push(move);
    }
    return groups;
  }, { levelUp: [], machine: [], other: [] });
}

export function formatEvolutionDetails(details) {
  if (!details || details.length === 0) return 'Evolução especial';

  return details.map((detail) => {
    const parts = [];
    if (detail.min_level) parts.push(`nível ${detail.min_level}`);
    if (detail.trigger) parts.push(formatName(detail.trigger.name));
    if (detail.item) parts.push(formatName(detail.item.name));
    if (detail.held_item) parts.push(`segurando ${formatName(detail.held_item.name)}`);
    if (detail.min_happiness) parts.push(`felicidade ${detail.min_happiness}+`);
    if (detail.min_beauty) parts.push(`beleza ${detail.min_beauty}+`);
    if (detail.known_move) parts.push(`sabendo ${formatName(detail.known_move.name)}`);
    if (detail.location) parts.push(`em ${formatName(detail.location.name)}`);
    if (detail.time_of_day) parts.push(detail.time_of_day);
    if (detail.needs_overworld_rain) parts.push('com chuva');
    if (detail.trade_species) parts.push(`troca por ${formatName(detail.trade_species.name)}`);
    if (detail.relative_physical_stats === 1) parts.push('Ataque > Defesa');
    if (detail.relative_physical_stats === 0) parts.push('Ataque = Defesa');
    if (detail.relative_physical_stats === -1) parts.push('Ataque < Defesa');
    return parts.join(' · ') || 'Condição especial';
  }).join(' ou ');
}
