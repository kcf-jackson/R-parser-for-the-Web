# An R parser for the Web

This repository ports the R BISON parser to the web using [JISON](https://github.com/zaach/jison). The derivation rules are identical to R BISON file `gram.y` in R 3.6.3. (Note that there are some new changes in R 4.0.0) The lexer is at the moment based on regular expression. This may result in minor differences, but none has been found so far. See more detail in [section 2](#2-notes) below. The parser returns a parse tree in which the nodes contain the *unprocessed* expressions. For instance, 
- "x <- 3 + 4" becomes ["<-", "x", ["+", "3", "4"]]
- "x <- 'Hello World'" becomes ["<-", "x", "'Hello World'"]

The parser also comes with a separate preprocessor to remove comments and redundant newlines so that the input conforms to the R grammar. This work is needed for the future development of the [sketch](https://github.com/kcf-jackson/sketch) package. 

---


## 1. Usage

The bundled file can be found at `./bin/parse_exprs.js`.

### Browser

Include the script tag in the html file.

```
<script src="./bin/parse_exprs.js"></script>
<script>
    console.log(parse_exprs("x <- 3"))
</script>
```

See the full example at `./examples/browser_usage.html`.


### Node.js

```
var parse_exprs = require("../bin/parse_exprs.js")  // take ~2 seconds
var result = parse_exprs("x <- 3; print('Hello World!'); y <- 4")
console.log(result)
```

This example can be found at `./examples/nodejs_usage.js`.



<!-- ### Online editor

[Try it out here](https://gitcdn.link/repo/kcf-jackson/R-parser-on-the-Web/master/examples/editor/index.html?token=ADBQ4RATBWDM3BPZL72H3XC6WEXQ6) and file an issue on github if there are errors. -->

---


## 2. Notes

### Dev environment setup

`package.json` contains information about the dependencies of this library.  
(`lex` for lexing, `jison` for parsing, `fs` for loading files during testing, and `browserify` for bundling.)

`makefile` contains all the commands needed to bundle the library from scratch and test it. 

### Tests

The parser goes through all but two files* in the R-3.6.3 `base` package (i.e. 854 out of 856 files) and parses them into JSON files. These files are then read into R, processed as lists and compared with the results returned by the R parser. Here is an illustration of the workflow.
```
        1           2
R file --->  JSON  ---> R list ---  5
        3           4             |---> Compare
R file ---> R expr ---> R list ---
```

- 1 is performed by `JS_test_full.js` (in the `./tests/test_code/JS_tests/` folder). 
- 2, 3 ,4, and 5 are performed by `test_full.R` (in the `./tests/test_code/R_tests/` folder).

The code for testing is stored in `./tests/test_code`. See the `readme.md` in the subfolders for more detail about the tests. Again, the commands to launch the tests can be found in `makefile`.

*The two files seem to have encoding that cannot be processed by my system.


---


## 3. Remarks

### 3.1. Grammar ambiguity 

One major challenge porting the R BISON parser to the web is that it is not clear how R resolves the ambiguity in the grammar. It turns out that, as JISON indicates, R relies on BISON to automatically resolve the Reduce/Reduce conflicts. Basically, BISON will apply the derivation rule that appears first in the grammar (see [references](#4-references) [6] and [7]). It is risky to rely on that, and some parser generators (e.g. nearley.js) would strongly advise users to fix the grammar rather than the parser. Regardless, JISON fixes the ambiguity like BISON, so problem solved.

### 3.2. Context-dependent lexing
<!-- Navigating the side-effect inferno in the lexer -->

Another main challenge is that the R lexer processes the newline character in a context-sensitive manner. The following is the summary of my investigation. To understand the context-sensitive lexer, there are two key variables to keep track of: `EatLines` and `*contextp`. 

`EatLines` is an integer that can take values 0 or 1. When it is 1, the newline character is skipped ("eaten"). When it is 0, the newline character *may be* returned as-is (it proceeds to some further branching to determine whether it will be skipped).

What value `EatLines` takes depends on the current token and the context variable `*contextp`. `*contextp` is a character stack, needed to handle nested contexts. There are 5 possible contexts, ' ', '(', '[', '{', 'i' corresponding to the empty context, contexts within the parentheses and context within a if-statement.

#### 3.2.1. Behaviour of `EatLines`

EatLines is set to 0

- during initialisation
- inside a exprlist call (`xxexprlist`) - because newline is needed within the exprlist to separate expressions
- right after the tokens: SYMBOL, STR_CONST, NUM_CONST, NULL_CONST, NEXT, BREAK - otherwise unintended merging of tokens may occur.
- when a square parenthesis is closed, i.e. token = ']' 
- when a round parenthesis is closed, i.e. token = ')' 

EatLines is set to 1
- when an empty token (whitespaces) is seen (i.e. newlines that appear after whitespaces can be skipped)
- inside a while-cond, if-cond or for-cond call (`xxcond`, `xxifcond`, `xxforcond`)
- when '\n' is seen in the context 'i' and the next non-newline token is ELSE (i.e. newlines between ifcond and ELSE can be skipped)
- right after a token that clearly indicates an incomplete line: "+", "-", "*", "/", "^", LT, LE, GE, GT, EQ, NE, OR, AND, OR2, AND2, SPECIAL, FUNCTION, WHILE, REPEAT, FOR, IN, "?", "!", "=", ":", "~", "$", "@", LEFT_ASSIGN, RIGHT_ASSIGN, EQ_ASSIGN
- right after IF
- right after ELSE
- right after a '{'


#### 3.2.2. Some simple examples

##### Example 1
```
function(x, y) {  # the newline character here is eaten
    x <- 1        # the newline character here is kept
    y <- 2        # the newline character here is kept
}                 # the newline character here is kept

```

##### Example 2
```
if (x == 1)         # the newline character here is eaten
   print("Hello!")  # the newline character here is kept

```

#### 3.2.3. Behaviour of `*contextp`

The context stack `*contextp`
- is set to ' ' during initialisation.

- if the current token is '(', '{', '[', then pushes the token to the stack
- if the current token is '[[', then pushes '[' twice to the stack
- in a `IfPush` call, if the current context is '{', '[', '(' or 'i', then pushes 'i' to the stack
    - `IfPush` is triggered when the current token is a IF token
    - top-level IF has no context

- if the current token is '\n', the current context is 'i', 
    - if next non-newline token closes a parenthesis, i.e. it is '}', ']' or ')', then pops until the context is not 'i', and then pops one more time
    - if next non-newline token is ',', then pops a context
    - if next non-newline token is ELSE, then pops a context
    - for all other tokens, pops a context. 
- if the current token is ELSE, then pops 'i' if there is one.
- if the current token is ';' or ',', then pops 'i' if there is one.
- if the current token is '}',']' or ')', then pops until the context is not 'i', then pop one more time.
- in a `ifpop` call, if the current context is 'i', pops a context 

#### 3.2.4. How the newline character is handled

1. EatLines == 1 or *contextp == '[' or '('  -> SKIP
2. EatLines == 0 and *contextp == i -> SKIP until the non-newline token, then
    - for '}', ']', ')', ',', ELSE -> no further actions
    - all else -> '\n'
3. EatLines == 0 and else -> '\n'


#### 3.2.5. Combining 3.2.2 - 3.2.4

It is remarkable how complicated it is to handle the newline characters in R files. The description in the [R manuel](https://cran.r-project.org/doc/manuals/r-release/R-lang.html#Separators) is concise, but the implementation in the [R source code](https://svn.r-project.org/R/trunk/src/main/gram.y) (search for "yylex(void)") is elaborate (and extremely difficult to track). Here is a summary:

1. newlines that appear after a continuing symbol or a separator symbol can be skipped. This includes:
    - Continuing symbol: '(', '[', '{', 'LBB', '-', '+', '!', '~', '?', ':',
        '*', '/', '^', '%', '$', '@', 
        'LEFT_ASSIGN', 'RIGHT_ASSIGN', 'OR', 'OR2', 'AND', 'AND2',
        'GE', 'LE', 'EQ', 'NE', 'EQ_ASSIGN', 'GT', 'LT', 
        'NS_GET_INT', 'NS_GET', 'SPECIAL', 
        'FUNCTION', 'WHILE', 'REPEAT', 'FOR', 'IF', 'IN', 'ELSE';
    - Separator symbol: 'COMMA', 'SEMICOLON'.

2. newlines that appear before 'SEMICOLON', 'COMMA', 'ELSE', 'IN', '}', ')', ']' can be skipped.

3. For any pair of consecutive newlines, remove the *second* one.

4. 
    (a) Newlines appear within an open '{' must be kept;
newlines appear within an open '(' or '[' are skipped;
the symbol closer to the newline decides which rule to follow.

    (b) For directives 'IF', 'FUNCTION', 'FOR', 'WHILE',
the newlines after the condition `(cond)` and before an expression / the body `{body}` can be skipped.

6. All other newline characters are kept as-is.

This is what gets implemented in this library, see `./src/preprocessor/preprocess.js` for the complete code listing.

### 3.3. Two-pass lexing

This library "approximates" the R lexer by a two-pass lexer. The first pass acts as a preprocessor to
1. remove all the comments,
2. fix incomplete last lines, and 
3. handle newline characters based on the context they are in (as outlined in the last section),

so that the resulting file conforms to the R grammar. Afterwards, the actual lexing (the second pass) and parsing begin.

---


## 4. References

JISON - BISON in JavaScript

1. [Home page](https://zaa.ch/jison/docs/#using-the-parser-from-the-web)
2. [Github](https://github.com/zaach/jison)
3. [Online editor](https://zaa.ch/jison/try/)

Flex - the lexer used by JISON

4. [Flex specification](http://dinosaur.compilertools.net/flex/flex_7.html#SEC7)
5. [Flex Regex tester](https://www.regextester.com/104875)

BISON - resolving ambiguities

6. [Reduce/Reduce Conflicts](http://dinosaur.compilertools.net/bison/bison_8.html#SEC78)
7. [Mysterious Reduce/Reduce Conflicts](http://dinosaur.compilertools.net/bison/index.html#SEC79)

Other resources

8. `gram.y`, [the R grammar file](https://github.com/wch/r-source/blob/trunk/src/main/gram.y)
9. [A list of related links](https://github.com/ropensci/ozunconf19/issues/28)

---
