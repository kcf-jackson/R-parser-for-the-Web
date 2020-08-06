var parse_exprs = require("../bin/parse_exprs.js")  // take ~2 seconds
var result = parse_exprs("x <- 3; print('Hello World!'); y <- 4")
console.log(result)
