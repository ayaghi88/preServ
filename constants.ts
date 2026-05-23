
export const SYSTEM_INSTRUCTION = `
You are an AI assistant inside an image generation app named "preSERV".

Your role is to:
- Accept reference images OR a detailed "AI Twin" text description.
- Accept a user prompt and an optional "Artistic Style".
- Generate exactly THREE high-quality, detailed prompt variations.
- Ensure the subject’s identity remains 100% consistent with the reference material.

STRICT CONSISTENCY RULES:
- The Subject's identity must be preserved exactly across all 3 frames.
- The OUTFIT must be identical in all 3 frames (same clothes, colors, textures).
- The SETTING/ENVIRONMENT must be identical in all 3 frames (same background, same location).
- ONLY the POSE should vary between the three frames.

PROMPT INSTRUCTIONS:
- Generate THREE comprehensive image-generation prompts.
- Output format: Return a numbered list 1 to 3. Each item is a high-detail prompt. No commentary. No labels.
`;

export interface ArtisticStyle {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  icon: string;
}

export const ARTISTIC_STYLES: ArtisticStyle[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'High contrast, dramatic shadows, film noir aesthetic.',
    promptSuffix: 'cinematic lighting, dramatic shadows, highly detailed film grain, moody atmosphere, anamorphic lens flares',
    icon: '🎬'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: '1970s film stock, warm tones, authentic grain.',
    promptSuffix: 'vintage 1970s color photography, kodachrome film stock, slight motion blur, authentic film grain, warm nostalgic tones',
    icon: '🎞️'
  },
  {
    id: 'anime',
    name: 'Anime',
    description: 'Clean lines, vibrant colors, cel-shaded look.',
    promptSuffix: 'high-quality anime style, cel-shaded, vibrant colors, clean linework, expressive background, Makoto Shinkai aesthetic',
    icon: '🎌'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft edges, expressive brushstrokes, paper texture.',
    promptSuffix: 'ethereal watercolor painting, fluid brushstrokes, soft edges, paper texture, artistic color bleeds, impressionist style',
    icon: '🎨'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic, neon glow, wet surfaces.',
    promptSuffix: 'cyberpunk aesthetic, neon glow, futuristic urban setting, wet pavement reflections, electric blue and hot pink highlights',
    icon: '🌃'
  },
  {
    id: 'oil',
    name: 'Oil Painting',
    description: 'Impasto technique, rich textures, museum quality.',
    promptSuffix: 'classic oil painting on canvas, heavy impasto texture, rich pigments, baroque lighting, museum quality masterpiece',
    icon: '🖼️'
  }
];

export interface ThemeTemplate {
  id: string;
  name: string;
  prompt: string;
  icon: string;
}

export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: 'quantum_quotes',
    name: 'Mindbending',
    icon: '🧠',
    prompt: "Surreal visual inspired by quantum reality. The subject is in a state of high-level strategy, with glowing, mindbending patterns about reality manifesting in the environment as holographic fragments. Ethereal, transcendental."
  },
  {
    id: 'break_chains',
    name: 'Break Chains',
    icon: '⛓️‍💥',
    prompt: "A powerful scene of breaking mental and spiritual chains. The subject is shattering massive glowing chains through pure willpower. Fragments of reality ripple like water. Cosmic energy, triumph."
  },
  {
    id: 'pinup',
    name: 'Pinup Style',
    icon: '💄',
    prompt: "Classic 1950s retro pinup style. Playful and glamorous pose, vintage victory rolls hairstyle, classic retro dress fashion, vibrant colors."
  },
  {
    id: 'ted_talk',
    name: 'TED Talk',
    icon: '🎙️',
    prompt: "Speaking authoritatively on a circular red TED stage. Professional wireless headset, dramatic stage lighting, huge screen behind displaying abstract diagrams."
  },
  {
    id: 'private_jet',
    name: 'Private Jet',
    icon: '🛩️',
    prompt: "Relaxing in the ultra-luxury cabin of a high-end private jet. Sleek leather seats, champagne flute on the tray, window view of the sun setting over the clouds."
  },
  {
    id: 'keep_outfit',
    name: 'Keep Outfit',
    icon: '👕',
    prompt: "[Current Prompt] ...while wearing the exact same clothing and accessories as seen in the reference material."
  }
];
