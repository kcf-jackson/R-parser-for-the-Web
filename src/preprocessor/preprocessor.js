/*
This file puts together "lexer.js" and "preprocess.js" into a single
function call to be used by a function at a higher abstraction level.
*/ 
var {tokenise} = require("./lexer.js");
var {splitPreprocess} = require("./preprocess.js");
function preprocessor(text) {
    if (text === "") {
        text = "\n";  // make empty string consistent with <return>
    }
    return splitPreprocess(tokenise(text));
}
module.exports = preprocessor;
