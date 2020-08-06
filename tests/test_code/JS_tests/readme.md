The test files should be called at the root directory of the repository. 

The tests should proceed in the following order:
JS_test_parse.js -> JS_test_basic.js -> JS_test_correctness.js

`JS_test_parse.js` tests that each R file in the base R package can be parsed without error. This only tests whether the parsing process is successful, but not whether the parse result is correct and aligns with the results from R. 

`JS_test_basic.js` tests that the JS parser works on the basic R expressions and produces a parse tree that matches the ones given by the R parser.

`JS_test_full.js` parses the files from the R base package to JSON, after which an R script will be run (separately) to compare the JSON and the R parse tree in R.

(Note: there are 856 files in the R-3.6.3 source code. Two of them have encodings that are not universal; they are not included for testing as the test results depend on the system encoding environment.)
