/*
# A lexer for preprocessing R code
It is different to the lexer associated with the R grammar in that
1. the newline character is not distinguished from the whitespace character;
2. comments are allowed.
*/
function lexerForPreprocessor() {
    let Lexer = require('lex');
    let lexer = new Lexer;

    // lexer rules for R
    lexer.addRule(/[^\S\r\n]+/, function(lexeme) { this.yytext = lexeme; return 'WS' });
    lexer.addRule(/<<-/, function(lexeme) { this.yytext = lexeme; return 'LEFT_ASSIGN' }); 
    lexer.addRule(/->>/, function(lexeme) { this.yytext = lexeme; return 'RIGHT_ASSIGN' }); 
    lexer.addRule(/<-/ , function(lexeme) { this.yytext = lexeme; return 'LEFT_ASSIGN' }); 
    lexer.addRule(/->/ , function(lexeme) { this.yytext = lexeme; return 'RIGHT_ASSIGN' }); 
    lexer.addRule(/\|\|/ , function(lexeme) { this.yytext = lexeme; return 'OR2' }); 
    lexer.addRule(/&&/ , function(lexeme) { this.yytext = lexeme; return 'AND2' }); 
    lexer.addRule(/>=/ , function(lexeme) { this.yytext = lexeme; return 'GE' }); 
    lexer.addRule(/<=/ , function(lexeme) { this.yytext = lexeme; return 'LE' }); 
    lexer.addRule(/==/ , function(lexeme) { this.yytext = lexeme; return 'EQ' }); 
    lexer.addRule(/!=/ , function(lexeme) { this.yytext = lexeme; return 'NE' }); 
    lexer.addRule(/=/  , function(lexeme) { this.yytext = lexeme; return 'EQ_ASSIGN' }); 
    lexer.addRule(/~/  , function(lexeme) { this.yytext = lexeme; return '~' }); 
    lexer.addRule(/\|/ , function(lexeme) { this.yytext = lexeme; return 'OR' }); 
    lexer.addRule(/&/  , function(lexeme) { this.yytext = lexeme; return 'AND' }); 
    lexer.addRule(/!/  , function(lexeme) { this.yytext = lexeme; return '!' }); 
    lexer.addRule(/>/  , function(lexeme) { this.yytext = lexeme; return 'GT' }); 
    lexer.addRule(/</  , function(lexeme) { this.yytext = lexeme; return 'LT' }); 
    lexer.addRule(/\+/  , function(lexeme) { this.yytext = lexeme; return '+' }); 
    lexer.addRule(/\-/  , function(lexeme) { this.yytext = lexeme; return '-' }); 
    lexer.addRule(/\*/  , function(lexeme) { this.yytext = lexeme; return '*' }); 
    lexer.addRule(/\//  , function(lexeme) { this.yytext = lexeme; return '/' }); 
    lexer.addRule(/:/   , function(lexeme) { this.yytext = lexeme; return ':' }); 
    lexer.addRule(/\^/  , function(lexeme) { this.yytext = lexeme; return '^' }); 
    lexer.addRule(/\$/  , function(lexeme) { this.yytext = lexeme; return '$' }); 
    lexer.addRule(/@/   , function(lexeme) { this.yytext = lexeme; return '@' }); 
    lexer.addRule(/:::/ , function(lexeme) { this.yytext = lexeme; return 'NS_GET_INT' }); 
    lexer.addRule(/::/  , function(lexeme) { this.yytext = lexeme; return 'NS_GET' }); 
    lexer.addRule(/\(/  , function(lexeme) { this.yytext = lexeme; return '(' }); 
    lexer.addRule(/\)/  , function(lexeme) { this.yytext = lexeme; return ')' }); 
    lexer.addRule(/\[\[/, function(lexeme) { this.yytext = lexeme; return 'LBB' }); 
    lexer.addRule(/\[/  , function(lexeme) { this.yytext = lexeme; return '[' }); 
    lexer.addRule(/\]/  , function(lexeme) { this.yytext = lexeme; return ']' }); 
    lexer.addRule(/\{/  , function(lexeme) { this.yytext = lexeme; return '{' }); 
    lexer.addRule(/\}/  , function(lexeme) { this.yytext = lexeme; return '}' }); 
    lexer.addRule(/\?/  , function(lexeme) { this.yytext = lexeme; return '?' }); 
    // Separators
    lexer.addRule(/,/  , function(lexeme) { this.yytext = lexeme; return 'COMMA' }); 
    lexer.addRule(/;/  , function(lexeme) { this.yytext = lexeme; return 'SEMICOLON' });
    lexer.addRule(/(\r\n|\r|\n)/,  function(lexeme) { this.yytext = lexeme; return 'NEWLINE' });
    // Constants
    lexer.addRule(/NULL/,          function(lexeme) { this.yytext = lexeme; return 'NULL_CONST' }); 
    lexer.addRule(/NA/,            function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    lexer.addRule(/TRUE/,          function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    lexer.addRule(/FALSE/,         function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    lexer.addRule(/Inf/,           function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    lexer.addRule(/NaN/,           function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    lexer.addRule(/NA_integer_/,   function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    lexer.addRule(/NA_real_/,      function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    lexer.addRule(/NA_character_/, function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    lexer.addRule(/NA_complex_/,   function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' }); 
    // keywords
    lexer.addRule(/function/,      function(lexeme) { this.yytext = lexeme; return 'FUNCTION' }); 
    lexer.addRule(/while/,         function(lexeme) { this.yytext = lexeme; return 'WHILE' }); 
    lexer.addRule(/repeat/,        function(lexeme) { this.yytext = lexeme; return 'REPEAT' }); 
    lexer.addRule(/for/,           function(lexeme) { this.yytext = lexeme; return 'FOR' }); 
    lexer.addRule(/if/,            function(lexeme) { this.yytext = lexeme; return 'IF' }); 
    lexer.addRule(/in/,            function(lexeme) { this.yytext = lexeme; return 'IN' }); 
    lexer.addRule(/else/,          function(lexeme) { this.yytext = lexeme; return 'ELSE' }); 
    lexer.addRule(/next/,          function(lexeme) { this.yytext = lexeme; return 'NEXT' }); 
    lexer.addRule(/break/,         function(lexeme) { this.yytext = lexeme; return 'BREAK' }); 

    lexer.addRule(/#[^\n]*/,       function(lexeme) { this.yytext = lexeme; return 'COMMENTS' });
    lexer.addRule(/%[^%]*%/,       function(lexeme) { this.yytext = lexeme; return 'SPECIAL' });

    // Numbers in decimals and/or scientific notation
    lexer.addRule(/(?:[0-9]+(?:[.][0-9]*)?|(?:[.][0-9]+))(?:[eE][+-]?[0-9]+)?[iL]?/, function(lexeme) { this.yytext = lexeme; return 'NUM_CONST' });
    lexer.addRule(/0[xX][0-9a-fA-F]+([pP][+-]?[0-9]+)?[iL]?/, function(lexeme) { this.yytext = lexeme; return 'NUM_CONST'; });

    // Double quoted strings
    lexer.addRule(/(\"([^\\\"]|\\.)*\")/, function(lexeme) { this.yytext = lexeme; return 'STR_CONST' });
    // Single quoted strings
    lexer.addRule(/(\'([^\\\']|\\.)*\')/, function(lexeme) { this.yytext = lexeme; return 'STR_CONST' });
    // Back-tick quoted strings
    lexer.addRule(/(\`([^\\\`]|\\.)*\`)/, function(lexeme) { this.yytext = lexeme; return 'SYMBOL' });

    // Identifier starting with an alphabet
    lexer.addRule(/[a-zA-Z][a-zA-Z0-9._]*/, function(lexeme) { this.yytext = lexeme; return 'SYMBOL' });
    // Identifier starting with a period (cannot followed by a digits)
    lexer.addRule(/[.][a-zA-Z._][a-zA-Z0-9._]*/, function(lexeme) { this.yytext = lexeme; return 'SYMBOL' });
    // Single dot, an edge case not captured in the last regex
    lexer.addRule(/[.]/, function(lexeme) { this.yytext = lexeme; return 'SYMBOL' });

    return lexer;
}

// Tokenise the input
// Tokens := [Token]
// Token  := {type: CHAR, value: CHAR}; 
function tokenise(text) {
    let lexer = lexerForPreprocessor();
    lexer.setInput(text);

    let tokens = [], token;
    while (token = lexer.lex()) {
        tokens.push({type: token, value: lexer.yytext});
    }
    return tokens;
}

module.exports = {
    "lexer": lexerForPreprocessor(),
    "tokenise": tokenise
}
