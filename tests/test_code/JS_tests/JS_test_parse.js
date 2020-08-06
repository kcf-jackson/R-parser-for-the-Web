/*
This file tests that the JS parser successfully parses all the R files
from the R base package into parse trees.
This file should be called at the directory where it resides.
*/
var fs = require("fs");
var path = require("path");
var parse_exprs = require(__dirname + "/../../../bin/parse_exprs.js");
let rFileDir = __dirname + "/../../test_files/R_files/";


// Helper functions
function file_path(dir, x) { return path.join(dir, x) }
function Red(x) { return "\033[31m" + x + "\033[39m" }
function Green(x) { return "\033[32m" + x + "\033[39m"}
function Yellow(x) { return "\033[33m" + x + "\033[39m" }

function hasParsingError(input) {
    let exprs = parse_exprs(input);
    return any(exprs.map(x => x === 'PARSING ERROR'));
}

function sum(x) { return x.reduce((x, y) => x + y, 0) }
function any(x) { return x.reduce((x, y) => x || y) }
function list_files(x) { return fs.readdirSync(x) }
function readLines(x) { return fs.readFileSync(x) }
function print(x) { console.log(x) }


// Going through files one by one and check if they have parsing errors
let fileList = list_files(rFileDir);
print(Yellow("There are " + fileList.length + " files to be tested."));

// Check each file for parsing error
let errCheck = fileList.map(function(fname) {
    let file = file_path(rFileDir, fname);
    let input = readLines(file).toString();
    let hasError = hasParsingError(input);
    print(fname + ": " + (hasError ? Red("Error") : Green("Okay")));
    return hasError;
});

// Print out summary
let numFail = sum(errCheck);
let numPass = fileList.length - numFail;
print(Yellow("Pass: " + numPass + "; Fail: " + numFail));
if (numFail > 0) {
    print(Yellow("Files to be fixed:"));
    errCheck.forEach(function(e, i) { if (e) { print(fileList[i]); } });
}
     