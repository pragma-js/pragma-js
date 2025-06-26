const ReactDOMServer = require('react-dom/server');
const beautify = require('js-beautify').html;
const { parseDSL } = require('./parser');

function renderDSL(dslText) {
    const trackers = parseDSL(dslText);
    if (!trackers || trackers.length === 0) return '';

    // For simplicity: render first element only (extend later for nested)
    const rootTracker = trackers[0];

    const html = ReactDOMServer.renderToStaticMarkup(rootTracker.root());
    return beautify(html, { indent_size: 2 });
}

module.exports = { renderDSL };