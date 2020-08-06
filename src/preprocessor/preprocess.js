// Preprocessor =====================================================================================================
// Preprocess the input
// preprocess :: [{type, value}] -> Char
function preprocess(input) {
    let f = [removeComments, removeRedundantNewline, endIncompleteline, unLex];
    return f.reduce((x,f) => f(x), input)
}


// removeComments :: [{type, value}] -> [{type, value}]
function removeComments(input) {
    return input.filter(x => x.type !== 'COMMENTS');
}

// removeRedundantNewline :: [{type, value}] -> [{type, value}]
function removeRedundantNewline(input) {
    let nwPos = findNewlinePosition(input);
    let rmFlag = nwPos.map(x => isNewlineRedundant(input, x));
    return removeByPosition(input, subset(nwPos, rmFlag));
}

// endIncompleteline :: [{type, value}] -> [{type, value}]
function endIncompleteline(input) {
    if (!['SEMICOLON', 'NEWLINE'].includes(last(input).type)) {
        input.push({type: "NEWLINE", value: '\n'});
    }
    return input;
}

// unLex :: [{type, value}] -> Char
function unLex(input) {
    return input.map(x => x.value)
                .reduce((x,y) => x+y);
}


function findNewlinePosition(x) {
    return which(x.map(el => el.type === 'NEWLINE'));
}

function isNewlineRedundant(input, pos) {
    // NEWLINE after continuing symbols can be removed safely
    let contTerms = [
        '(', '[', '{', 'LBB', '-', '+', '!', '~', '?', ':',
        '*', '/', '^', '%', '$', '@', 
        'LEFT_ASSIGN', 'RIGHT_ASSIGN', 'OR', 'OR2', 'AND', 'AND2',
        'GE', 'LE', 'EQ', 'NE', 'EQ_ASSIGN', 'GT', 'LT', 
        'NS_GET_INT', 'NS_GET', 'SPECIAL', 
        'FUNCTION', 'WHILE', 'REPEAT', 'FOR', 'IF', 'IN', 'ELSE'
    ];
    // NEWLINE after separators can be removed safely
    let sepTerms = ['COMMA', 'SEMICOLON'];
    let lastToken = lastNon_WS_NW(input, pos).type;
    if (contTerms.includes(lastToken) || sepTerms.includes(lastToken)) {
        return true;
    }     
    
    /* ')', ']' and 'COMMA' are handled also by `checkContext` in the next
    round. Including them here improves the performance of the checking
    as `checkContext` requires searching backward for the context. */
    let endTerms = ['SEMICOLON', 'COMMA', 'ELSE', 'IN', '}', ')', ']'];
    let nextToken = nextNon_WS_NW(input, pos).type;
    if (endTerms.includes(nextToken)) {
        return true;
    }   

    // Remove duplicates in consecutive NEWLINES
    if (lastNonWS(input, pos).type === 'NEWLINE') {
        return true;
    }

    if (checkContext(input, pos)) {
        return true;
    }

    // add further rules here if needed
    return false;
}


function lastNonToken(input, pos, tokens) {
    while (pos > 0) {
        pos = pos - 1;
        if (!tokens.includes(input[pos].type)) {
            return input[pos];
        } 
    }
    return {};
}
const lastNon_WS_NW = (input, pos) => lastNonToken(input, pos, ['WS', 'NEWLINE']);
const lastNonWS     = (input, pos) => lastNonToken(input, pos, ['WS']);


function nextNonToken(input, pos, tokens) {
    while (pos < input.length - 1) {
        pos = pos + 1;
        if (!tokens.includes(input[pos].type)) {
            return input[pos];
        } 
    }
    return {};
}
const nextNon_WS_NW = (input, pos) => nextNonToken(input, pos, ['WS', 'NEWLINE']);
const nextNonWS     = (input, pos) => nextNonToken(input, pos, ['WS']);


// checkContext :: [{type, value}] -> Int -> Bool
function checkContext(input, pos) {
    let round = 0, square = 0, curly = 0;
    let compoundDirectives = ['IF', 'FUNCTION', 'FOR', 'WHILE'];
    
    let DEBUG = false;
    //if (pos > 1 && input[pos - 1].value === '}') DEBUG = true;
    DEBUG && console.log("Begin context check:")
    DEBUG && console.log(pos)
    for (let i = 1; i <= pos; i++) {
        if (input[pos - i].type === ')') { round = round - 1; }
        if (input[pos - i].type === '(') { round = round + 1; }
        if (input[pos - i].type === ']') { square = square - 1; }
        if (input[pos - i].type === '[') { square = square + 1; }
        if (input[pos - i].type === 'LBB') { square = square + 2; }
        if (input[pos - i].type === '}') { curly = curly - 1; }
        if (input[pos - i].type === '{') { curly = curly + 1; }
        
        DEBUG && console.log(pos - i);
        DEBUG && console.log(input[pos - i]);
        DEBUG && console.log(round + ", " + square + ", " + curly);
        if (curly > 0) { 
            DEBUG && console.log("Open '{' => Keep newline.");
            return false; 
        }
        if ((round > 0) || (square > 0)) { 
            DEBUG && console.log("Open '(', '[' => Remove newline.");
            return true; 
        }
                
        if (compoundDirectives.includes(input[pos - i].type)) { 
            DEBUG && console.log("Detect directive: " + input[pos - i].type);
            if (hasOneContextSwitch(input, pos-i+1, pos)) {
                DEBUG && console.log("Special directive: Remove newline.");
                return true;
            }
        }
    }
    DEBUG && console.log("No rules apply => Keep newline.")
    return false;
}

function hasOneContextSwitch(input, start, end) {
    let count = 0, round = 0;
    let token;
    for (let i = start; i < end; i++) {
        token = input[i];
        if (token.type === '(') { 
            round = round + 1; 
        } else if (token.type === ')') { 
            round = round - 1;
            // whenever all '('s are matched, count one completion
            if (round === 0) {
                count = count + 1;
                return (nextNonWSPos(input, i) === end)
            }
        }
    }
    return false;
}

function nextNonWSPos(input, pos) {
    while (pos < input.length - 1) {
        pos = pos + 1;
        if (input[pos].type !== 'WS') {
            return pos;
        } 
    }
}


// Utility functions ==============================================================
// Subset an array by a boolean array
// subset :: [*] -> [Bool] -> [*]
function subset(x, pred) {
    res = [];
    for (let i = 0; i < x.length; i++) {
        if (pred[i]) {
            res.push(x[i])
        }
    }
    return res;
}

// Subset an array by removing some elements by position
// removeByPosition :: [*] -> [Int] -> [*]
function removeByPosition(x, ind) {
    res = []
    for (let i = 0; i < x.length; i++) {
        if (!ind.includes(i)) {
            res.push(x[i])
        }
    }
    return res;
}

function last(x) { return x[x.length - 1] }

function which(x) {
    res = [];
    for (let i = 0; i < x.length; i++) {
        if (x[i]) {
            res.push(i)
        } 
    }
    return res;
}


// Splitter =====================================================================================================
/* A splitter turns a string containing multiple expressions into an array of string, 
each containing one and only one expression.*/

// Split and Preprocess the input
// splitPreprocess :: [{type, value}] -> Char
function splitPreprocess(input) {
    let fs = [removeComments, removeRedundantNewline, endIncompleteline, splitExpression];
    return freduce(fs, input).map(unLex);
}

function freduce(fs, x) {
    return fs.reduce((x, f) => f(x), x);
}

// splitExpression :: [{type, value}] -> [ [{type, value}] ]
function splitExpression(input) {
    let nwPos = findSeparatorPosition(input);
    let splitFlag = nwPos.map(x => isValidSplit(input, x));
    return splitArrayByPosition(input, subset(nwPos, splitFlag));
}

function findSeparatorPosition(x) {
    return which(x.map(el => ['NEWLINE', 'SEMICOLON'].includes(el.type)));
}

function isValidSplit(input, pos) {
    let curly = 0;
    for (let i = 1; i <= pos; i++) {
        if (input[pos - i].type === '}') { curly = curly - 1; }
        if (input[pos - i].type === '{') { curly = curly + 1; }
        if (curly > 0) { return false; }
    }
    return true;
}

function splitArrayByPosition(input, pos) {
    if (pos.length === 0) return [input];

    splittedArray = [];
    buffer = [];
    for (let i = 0; i < input.length; i++) {
        if (pos.includes(i) || (i === input.length - 1)) {
            buffer.push(input[i]);
            splittedArray.push(buffer);
            buffer = [];
        } else {
            buffer.push(input[i]);
        }
    }
    return splittedArray;
}


module.exports = {
    "preprocess": preprocess,           // exported for testing during development stage
    "splitPreprocess": splitPreprocess  // this is the general case which will be used in production
}
