import json from './DEFAULT_FLAGS.json' assert { type: 'json' };

export default function FlagLoader() {
    try {
        if (!json.flags || typeof json.flags !== 'object') {
            throw new Error('Missing or invalid "flags" in config.json');
        }

        return { ...DEFAULT_FLAGS, ...json.flags };
    } catch (err) {
        console.warn('[FlagManager] Failed to load config.json:', err.message);
        return json;
    }
}