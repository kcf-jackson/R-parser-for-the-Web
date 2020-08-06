/*
This file tests that the JS parser correctly parses the basic R expressions.
This file should be called at the directory where it resides.
*/

// JS parser
var parse_exprs = require(__dirname + "/../../../bin/parse_exprs.js");


// Helpers
function testPair(x, y) {
    // input and expected output
    return {input: x, output: '[' + y + ']'};
}
function Red(x) { return "\033[31m" + x + "\033[39m" }
function Green(x) { return "\033[32m" + x + "\033[39m"}
function Yellow(x) { return "\033[33m" + x + "\033[39m" }


// Main
testCases = [
    //expressions
    testPair('\n', '[]'),
    testPair('x\n', '"x"'),
    testPair('123;', '"123"'),
    testPair('123;456', '"123","456"'),
    testPair(';', '"PARSING ERROR"'),
    //expr_or_assign
    testPair('\'Hello World\'', '"\'Hello World\'"'),
    testPair('x = 3', '["=","x","3"]'),
    //equal_assign
    testPair('x = y = 3', '["=","x",["=","y","3"]]'),
    //expr
    testPair('1e2;', '"1e2"'),
    testPair('0.23;', '"0.23"'),
    testPair('\'Hello World\'', '"\'Hello World\'"'),
    testPair('\"Hello World\"', '"\\"Hello World\\""'),
    testPair('NULL', '"NULL"'),
    testPair('symbol_name', '"symbol_name"'),
    testPair('NULL.for.none', '"NULL.for.none"'),

    testPair('{a <- 2; b <- 3}', '["{",["<-","a","2"],["<-","b","3"]]'),
    testPair('(x <- 3)', '["(",["<-","x","3"]]'),

    testPair('-a', '["-","a"]'),
    testPair('+a', '["+","a"]'),
    testPair('!a', '["!","a"]'),
    testPair('~a', '["~","a"]'),
    testPair('?a', '["?","a"]'),
    
    testPair('1:10', '[":","1","10"]'),
    testPair('1 + 2', '["+","1","2"]'),
    testPair('4 - 2', '["-","4","2"]'),
    testPair('2 * 13', '["*","2","13"]'),
    testPair('42 / 129', '["/","42","129"]'),
    testPair('3 ^ 2', '["^","3","2"]'),
    testPair('a %+% b', '["%+%","a","b"]'),
    testPair('a %=>% b', '["%=>%","a","b"]'),
    testPair('a %>% b', '["%>%","a","b"]'),
    testPair('a %*% b', '["%*%","a","b"]'),
    testPair('123 %% 3', '["%%","123","3"]'),
    testPair('y ~ x + z', '["~","y",["+","x","z"]]'),
    testPair('a ? b', '["?","a","b"]'),
    testPair('1 < 2', '["<","1","2"]'),
    testPair('1 <= 3', '["<=","1","3"]'),
    testPair('2 == 4', '["==","2","4"]'),
    testPair('2 != 4', '["!=","2","4"]'),
    testPair('2 > 4', '[">","2","4"]'),
    testPair('2 >= 4', '[">=","2","4"]'),
    testPair('a & b', '["&","a","b"]'),
    testPair('a | b', '["|","a","b"]'),
    testPair('a && b', '["&&","a","b"]'),
    testPair('a || b', '["||","a","b"]'),

    testPair('a <- 3', '["<-","a","3"]'),
    testPair('3 -> a', '["<-","a","3"]'),
    testPair('function() {1 + 1}', '["function",[],["{",["+","1","1"]]]'),
    testPair('function(x) {x + 1}', '["function",[{"x":""}],["{",["+","x","1"]]]'),
    testPair('function(x, y) {x + y}', '["function",[{"x":"","y":""}],["{",["+","x","y"]]]'),
    testPair('function(x = 1, y) {x + y}', '["function",[{"x":"1","y":""}],["{",["+","x","y"]]]'),
    testPair('function(x = 1, y = 3) {x + y}', '["function",[{"x":"1","y":"3"}],["{",["+","x","y"]]]'),
    testPair('function(x, y) x + y', '["function",[{"x":"","y":""}],["+","x","y"]]'),
    testPair('f()', '["f",{}]'),
    testPair('f(x)', '["f","x"]'),
    testPair('f(x, y)', '["f","x","y"]'),
    testPair('f(x = 2, y)', '["f",{"x":"2"},"y"]'),
    testPair('if (TRUE) x', '["if","TRUE","x"]'),
    testPair('if (TRUE) {x + 1}', '["if","TRUE",["{",["+","x","1"]]]'),
    testPair('if (TRUE) x else y', '["if","TRUE","x","y"]'),
    testPair('if (TRUE) x else { y }', '["if","TRUE","x",["{","y"]]'),
    testPair('if (TRUE) {x} else y', '["if","TRUE",["{","x"],"y"]'),
    testPair('for (i in 1:10) print(i)', '["for","i",[":","1","10"],["print","i"]]'),
    testPair('for (i in 1:10) {print(i)}', '["for","i",[":","1","10"],["{",["print","i"]]]'),
    testPair('for (i in 1:10) {print(i); x+2;}', '["for","i",[":","1","10"],["{",["print","i"],["+","x","2"]]]'),
    testPair('while (TRUE) do(x)', '["while","TRUE",["do","x"]]'),
    testPair('while (TRUE) { do(x) }', '["while","TRUE",["{",["do","x"]]]'),
    testPair('repeat do(x)', '["repeat",["do","x"]]'),
    testPair('repeat { do(x) }', '["repeat",["{",["do","x"]]]'),
    testPair('x[[]]', '["[[","x",{}]'),
    testPair('x[[12]]', '["[[","x","12"]'),
    testPair('x[[12, 23]]', '["[[","x","12","23"]'),
    testPair('x[]', '["[","x",{}]'),
    testPair('x[1]', '["[","x","1"]'),
    testPair('x[1,2]', '["[","x","1","2"]'),
    testPair('x::fun', '["::","x","fun"]'),
    testPair('x::"abc"', '["::","x","\\"abc\\""]'),
    testPair('"base"::fun', '["::","\\"base\\"","fun"]'),
    testPair('"base"::"fun"', '["::","\\"base\\"","\\"fun\\""]'),
    testPair('x:::fun', '[":::","x","fun"]'),
    testPair('x:::"abc"', '[":::","x","\\"abc\\""]'),
    testPair('"base":::fun', '[":::","\\"base\\"","fun"]'),
    testPair('"base":::"fun"', '[":::","\\"base\\"","\\"fun\\""]'),
    testPair('x$a', '["$","x","a"]'),
    testPair('x$"a"', '["$","x","\\"a\\""]'),
    testPair('x@a', '["@","x","a"]'),
    testPair('x@"a"', '["@","x","\\"a\\""]'),
    testPair('next', '["next"]'),
    testPair('break', '["break"]'),
    // cond, ifcond, forcond are embedded above
    // exprlist
    testPair('{x <- 1}', '["{",["<-","x","1"]]'),
    testPair('{x <- 1; y <- 2}', '["{",["<-","x","1"],["<-","y","2"]]'),
    testPair('{x <- 1;}', '["{",["<-","x","1"]]'),
    testPair('{x <- 1 \n y <- 2}', '["{",["<-","x","1"],["<-","y","2"]]'),
    testPair('{x <- 1 \n}', '["{",["<-","x","1"]]'),
    // sublist and sub
    testPair('f(x)', '["f","x"]'),
    testPair('f(x, y, z)', '["f","x","y","z"]'),
    testPair('f(x=1, y=2, z)', '["f",{"x":"1"},{"y":"2"},"z"]'),
    testPair('f("x"=1, y=2, z)', '["f",{"\\"x\\"":"1"},{"y":"2"},"z"]'),
    testPair('f("x"=, y=, z)', '["f",{"\\"x\\"":""},{"y":""},"z"]'),
    testPair('f("x"=, y=, NULL=)', '["f",{"\\"x\\"":""},{"y":""},{"NULL":""}]'),
    testPair('f("x"=1, y=2, NULL=3)', '["f",{"\\"x\\"":"1"},{"y":"2"},{"NULL":"3"}]'),
    // formlist
    testPair('function(x) {}', '["function",[{"x":""}],["{"]]'),
    testPair('function(x = 1) {}', '["function",[{"x":"1"}],["{"]]'),
    testPair('function(x, y) {}', '["function",[{"x":"","y":""}],["{"]]'),
    testPair('function(x, y = 2) {}', '["function",[{"x":"","y":"2"}],["{"]]')

]


let testPass = testCases.map(function(e,i) {
    let output = JSON.stringify(parse_exprs(e.input));
    let pass = output === e.output;
    console.log(Yellow("Input:\t\t\t" + e.input))
    console.log("Output:\t\t\t" + output);
    console.log("Expected output:\t" + e.output);
    console.log("Pass test: " + (pass ? Green(pass) : Red(pass)));
    return output === e.output;
})
let numPass = testPass.reduce((x,y) => x + y, 0);
let numFail = testPass.length - numPass;
console.log("Tests: " + Yellow(testPass.length) + 
            "; Pass: " + Green(numPass) + 
            "; Fail: " + Red(numFail));
