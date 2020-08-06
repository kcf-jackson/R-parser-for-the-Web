var gram = require('./gram.js')
var preprocessor = require('../preprocessor/preprocessor.js')

function parse_exprs(x) {
    return preprocessor(x).map(expr => gram.parse(expr));
}

module.exports = parse_exprs;
