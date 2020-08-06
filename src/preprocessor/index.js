// This file is used for testing and debugging purposes.
var {tokenise} = require("./lexer.js");
var {preprocess, splitPreprocess} = require("./preprocess.js")

// Make a dividing line
function dividingLine(sym = '=', len = 60) {
    return Array(len).fill(sym).reduce((a,b) => a + b);
}
const IN_YELLOW = "\033[33m%s\033[39m";
const IN_GREEN = "\033[32m%s\033[39m";

//===========================================================================================================================
// Unit test for lexer and tokeniser
var inputs = [
    "f <- function(x, y) {\n\t# Some comment here\n\tx + y\n\t-2.313 + 0.13e-82\n\treturn('hello \" world \\n!') \n}",
    "NULL",
    "NULL.124"  // Correctly handled by our custom lexer.js but not the jison.js library
]

inputs.map(function(text) {
    console.log(dividingLine());
    console.log(IN_YELLOW, "Testing tokeniser")
    console.log(IN_GREEN, "Input:")
    console.log(text);
    
    console.log(IN_GREEN, "Results from the tokeniser:")
    tokenise(text).map(x => console.log(x));    
})

//===========================================================================================================================
// Unit test for preprocessor
var inputs = [
    "f <- function(x, y) {\n\t# Some comment here\n\tx + \ny;\n\n\t-2.313 + \n0.13e-82;\n\treturn(\n'hello \" world \\n!'\n) \n}",
    "test_fun <- function(x, y) {\n    x + y + 1\n    x <- 2\n}\n",
    "collapseBuffer <- function() {\n    # Collapse the writes in the buffer up to the marked position into the first buffer entry\n    nonWS <- \"\"\n    if (marked > 0) {\n      nonWS <- paste(buffer[seq_len(marked)], collapse=\"\")\n    }\n\n    # Collapse any remaining whitespace\n    ws <- \"\"\n    remaining <- position - marked\n    if (remaining > 0) {\n      # We have some whitespace to collapse. Collapse it into the second buffer entry.\n      ws <- paste(buffer[seq(from=marked+1,to=marked+remaining)], collapse=\"\")\n    }\n\n    buffer[1] <<- nonWS\n    buffer[2] <<- ws\n    position <<- 2\n    marked <<- 1\n }\n "
]

inputs.map(function(text) {
    console.log(dividingLine())
    console.log(IN_YELLOW, "Testing preprocessor")
    console.log(IN_GREEN, "Input:")
    console.log(text);
    
    console.log(IN_GREEN, "Results from the preprocessor:")
    console.log(preprocess(tokenise(text)));    
})

//===========================================================================================================================
// Unit test for splitter
var inputs = [
    "x <- 3 \ny <- 4 \n",
    "x <- 3 \n",
    "x <- 100 \ntest_fun <- function(x, y) {\n    x + y + 1\n    x <- 2\n}\n",
    "test_fun <- function(x, y) {\n    x + y + 1\n}",
    "test_fun <- function(x, y) {\n    x + y + 1\n}\n",
    "test_fun <- function(x, y) {\n    x + y + 1\n}\nx<-100",
    "x <- 3;  y <- 4",
    "x <- 3;  y <- 4;",
    "test_fun <- function(x, y) {\n    x + y + 1\n    z <- 2\n}\nx<-100",
    "test_fun <- function(x, y) {\n    x + y + 1; z <- 2\n}\nx<-100",
    "z <- 2\nWSTextWriter <- function(bufferSize=1024) {\n  if (bufferSize < 3) {\n    stop(\"Buffer size must be at least 3\")\n  }\n\n  # The buffer into which we enter all the writes.\n  buffer <- character(bufferSize)\n\n  # The index storing the position in the buffer of the most recent write.\n  marked <- 0\n\n  # The index storing the position in the buffer of the most recent write or writeWS.\n  position <- 0\n\n  # TRUE if we're eating whitespace right now, in which case calls to writeWS are no-ops.\n  suppressing <- FALSE\n\n  # Collapses the text in the buffer to create space for more writes. The first\n  # element in the buffer will be the concatenation of any writes up to the\n  # current marker. The second element in the buffer will be the concatenation\n  # of all writes after the marker.\n  collapseBuffer <- function() {\n    # Collapse the writes in the buffer up to the marked position into the first buffer entry\n    nonWS <- \"\"\n    if (marked > 0) {\n      nonWS <- paste(buffer[seq_len(marked)], collapse=\"\")\n    }\n\n    # Collapse any remaining whitespace\n    ws <- \"\"\n    remaining <- position - marked\n    if (remaining > 0) {\n      # We have some whitespace to collapse. Collapse it into the second buffer entry.\n      ws <- paste(buffer[seq(from=marked+1,to=marked+remaining)], collapse=\"\")\n    }\n\n    buffer[1] <<- nonWS\n    buffer[2] <<- ws\n    position <<- 2\n    marked <<- 1\n  }\n}\n"
]

inputs.map(function(text, i) {
    console.log(dividingLine())
    console.log(IN_YELLOW, "Testing expressions splitter")
    console.log(IN_GREEN, "Input " + (i+1) + ":")
    console.log(text)

    console.log(IN_GREEN, "Results from the splitter:")
    splitPreprocess(tokenise(text)).map(function(expr, i) {
        console.log(IN_GREEN, "Expression " + (i+1))
        console.log(expr)
    })
})
