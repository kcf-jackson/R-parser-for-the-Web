const fs = require("fs");
const path = require("path");
const parse_exprs = require(__dirname + "/../../../bin/parse_exprs.js");
const inputDir = __dirname + "/../../test_files/R_files";
const outputDir = __dirname + "/../../test_files/JSON_files";

function readLines(x) { return fs.readFileSync(x) }
function file_path(dir, x) { return path.join(dir, x) }
function list_files(x) { return fs.readdirSync(x) }

function R2JSON(file_in, file_out) {
    let input = readLines(file_in).toString();
    let output = JSON.stringify(parse_exprs(input)) + '\n';
    if (file_out === "") { 
        console.log(output)
    } else {
        let fname = path.basename(file_in, ".R") + ".JSON"
        let file_out = file_path(outputDir, fname)
        fs.writeFileSync(file_out, output);
    }
    return output; 
}

// A folder
console.log("Parsing R files into JSON files for further comparison:")
let out = list_files(inputDir).map(function(file) {
    console.log(file)
    return R2JSON(file_path(inputDir, file));
});
