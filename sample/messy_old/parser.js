const { createHeapBoundElementTracker } = require('./tracker');

function parseLine(line) {
    // Basic split: type [id/class/style...] [children or text...]
    // Example: div container #eee 10px
    const tokens = line.trim().split(/\s+/);
    if (tokens.length === 0) return null;

    const tracker = createHeapBoundElementTracker();

    // First token = element type (tag)
    tracker.type = tokens[0];

    // Parse rest tokens: simple heuristic:
    // If token starts with # or is color hex => style.backgroundColor
    // If token ends with px/rem/% => style.margin or padding heuristic
    // Otherwise if looks like an identifier => id or class (simplify as id for demo)
    // Otherwise if token is a string in quotes => children text

    const styles = {};
    const children = [];

    for (let i = 1; i < tokens.length; i++) {
        const t = tokens[i];
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)) {
            styles.backgroundColor = t;
        } else if (/^\d+(px|rem|%)$/.test(t)) {
            // Add margin for demo (first margin, else padding)
            if (!styles.margin) styles.margin = t;
            else styles.padding = t;
        } else if (/^[a-zA-Z][\w-]*$/.test(t)) {
            tracker.id = t;
        } else if (/^".*"$/.test(t)) {
            children.push(t.slice(1, -1));
        } else {
            // fallback: add as child text
            children.push(t);
        }
    }

    if (Object.keys(styles).length) {
        Object.assign(tracker, styles);
    }
    if (children.length) {
        tracker.children = children.length === 1 ? children[0] : children;
    }

    return tracker;
}

function parseDSL(dslText) {
    const lines = dslText.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
    const rootTrackers = lines.map(parseLine);
    return rootTrackers;
}

module.exports = { parseDSL };