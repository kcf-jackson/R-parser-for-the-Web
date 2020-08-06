all: build test

build:
	jison ./src/parser/gram.jison -o ./src/parser/gram.js
	browserify -t brfs ./src/parser/parser.js --standalone parse_exprs > ./bin/parse_exprs.js

test:
	node ./tests/test_code/JS_tests/JS_test_parse.js
	node ./tests/test_code/JS_tests/JS_test_basic.js
	node ./tests/test_code/JS_tests/JS_test_full.js
	Rscript ./tests/test_code/R_tests/test_full.R
