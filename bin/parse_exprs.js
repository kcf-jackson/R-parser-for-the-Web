(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.parse_exprs = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
if (typeof module === "object" && typeof module.exports === "object") module.exports = Lexer;

Lexer.defunct = function (chr) {
    throw new Error("Unexpected character at index " + (this.index - 1) + ": " + chr);
};

function Lexer(defunct) {
    if (typeof defunct !== "function") defunct = Lexer.defunct;

    var tokens = [];
    var rules = [];
    var remove = 0;
    this.state = 0;
    this.index = 0;
    this.input = "";

    this.addRule = function (pattern, action, start) {
        var global = pattern.global;

        if (!global) {
            var flags = "g";
            if (pattern.multiline) flags += "m";
            if (pattern.ignoreCase) flags += "i";
            pattern = new RegExp(pattern.source, flags);
        }

        if (Object.prototype.toString.call(start) !== "[object Array]") start = [0];

        rules.push({
            pattern: pattern,
            global: global,
            action: action,
            start: start
        });

        return this;
    };

    this.setInput = function (input) {
        remove = 0;
        this.state = 0;
        this.index = 0;
        tokens.length = 0;
        this.input = input;
        return this;
    };

    this.lex = function () {
        if (tokens.length) return tokens.shift();

        this.reject = true;

        while (this.index <= this.input.length) {
            var matches = scan.call(this).splice(remove);
            var index = this.index;

            while (matches.length) {
                if (this.reject) {
                    var match = matches.shift();
                    var result = match.result;
                    var length = match.length;
                    this.index += length;
                    this.reject = false;
                    remove++;

                    var token = match.action.apply(this, result);
                    if (this.reject) this.index = result.index;
                    else if (typeof token !== "undefined") {
                        switch (Object.prototype.toString.call(token)) {
                        case "[object Array]":
                            tokens = token.slice(1);
                            token = token[0];
                        default:
                            if (length) remove = 0;
                            return token;
                        }
                    }
                } else break;
            }

            var input = this.input;

            if (index < input.length) {
                if (this.reject) {
                    remove = 0;
                    var token = defunct.call(this, input.charAt(this.index++));
                    if (typeof token !== "undefined") {
                        if (Object.prototype.toString.call(token) === "[object Array]") {
                            tokens = token.slice(1);
                            return token[0];
                        } else return token;
                    }
                } else {
                    if (this.index !== index) remove = 0;
                    this.reject = true;
                }
            } else if (matches.length)
                this.reject = true;
            else break;
        }
    };

    function scan() {
        var matches = [];
        var index = 0;

        var state = this.state;
        var lastIndex = this.index;
        var input = this.input;

        for (var i = 0, length = rules.length; i < length; i++) {
            var rule = rules[i];
            var start = rule.start;
            var states = start.length;

            if ((!states || start.indexOf(state) >= 0) ||
                (state % 2 && states === 1 && !start[0])) {
                var pattern = rule.pattern;
                pattern.lastIndex = lastIndex;
                var result = pattern.exec(input);

                if (result && result.index === lastIndex) {
                    var j = matches.push({
                        result: result,
                        action: rule.action,
                        length: result[0].length
                    });

                    if (rule.global) index = j;

                    while (--j > index) {
                        var k = j - 1;

                        if (matches[j].length > matches[k].length) {
                            var temple = matches[j];
                            matches[j] = matches[k];
                            matches[k] = temple;
                        }
                    }
                }
            }
        }

        return matches;
    }
}

},{}],2:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var gram = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,8],$V1=[1,9],$V2=[1,10],$V3=[1,11],$V4=[1,12],$V5=[1,13],$V6=[1,14],$V7=[1,15],$V8=[1,16],$V9=[1,17],$Va=[1,18],$Vb=[1,19],$Vc=[1,20],$Vd=[1,21],$Ve=[1,22],$Vf=[1,23],$Vg=[1,24],$Vh=[1,25],$Vi=[1,50],$Vj=[1,30],$Vk=[1,29],$Vl=[1,36],$Vm=[1,37],$Vn=[1,28],$Vo=[1,31],$Vp=[1,32],$Vq=[1,33],$Vr=[1,34],$Vs=[1,35],$Vt=[1,38],$Vu=[1,39],$Vv=[1,40],$Vw=[1,41],$Vx=[1,42],$Vy=[1,43],$Vz=[1,44],$VA=[1,45],$VB=[1,46],$VC=[1,47],$VD=[1,48],$VE=[1,49],$VF=[1,51],$VG=[1,52],$VH=[1,53],$VI=[1,54],$VJ=[5,7,10,17,18,19,20,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,49,55,56,57,60,61,66],$VK=[2,10],$VL=[1,56],$VM=[1,57],$VN=[2,11],$VO=[2,12],$VP=[1,58],$VQ=[1,59],$VR=[5,7,17],$VS=[19,66],$VT=[2,76],$VU=[1,102],$VV=[1,103],$VW=[1,101],$VX=[56,66],$VY=[5,7,10,17,19,20,21,23,24,25,26,27,29,31,32,33,34,35,36,37,38,39,40,41,42,49,56,66],$VZ=[5,7,10,17,19,23,24,37,38,39,40,41,42,49,56,66],$V_=[5,7,10,17,19,23,24,41,42,49,56,66],$V$=[5,7,10,17,19,24,49,56,66],$V01=[5,7,10,17,19,20,21,23,24,31,32,33,34,35,36,37,38,39,40,41,42,49,56,66],$V11=[5,7,10,17,19,20,21,23,24,26,27,31,32,33,34,35,36,37,38,39,40,41,42,49,56,66],$V21=[5,7,10,17,19,23,24,38,40,41,42,49,56,66],$V31=[2,89],$V41=[19,56,66],$V51=[18,19,20,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,55,56,57,60,61,66],$V61=[11,12,13,14,15,18,20,21,22,23,24,43,47,50,52,54,62,63];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"expressions":3,"END_OF_INPUT":4,"\\n":5,"expr_or_assign":6,";":7,"expr":8,"equal_assign":9,"EQ_ASSIGN":10,"NUM_CONST":11,"STR_CONST":12,"NULL_CONST":13,"SYMBOL":14,"{":15,"exprlist":16,"}":17,"(":18,")":19,"-":20,"+":21,"!":22,"~":23,"?":24,":":25,"*":26,"/":27,"^":28,"SPECIAL":29,"%":30,"LT":31,"LE":32,"EQ":33,"NE":34,"GE":35,"GT":36,"AND":37,"OR":38,"AND2":39,"OR2":40,"LEFT_ASSIGN":41,"RIGHT_ASSIGN":42,"FUNCTION":43,"formlist":44,"cr":45,"sublist":46,"IF":47,"ifcond":48,"ELSE":49,"FOR":50,"forcond":51,"WHILE":52,"cond":53,"REPEAT":54,"LBB":55,"]":56,"[":57,"NS_GET":58,"NS_GET_INT":59,"$":60,"@":61,"NEXT":62,"BREAK":63,"IN":64,"sub":65,",":66,"$accept":0,"$end":1},
terminals_: {2:"error",4:"END_OF_INPUT",5:"\\n",7:";",10:"EQ_ASSIGN",11:"NUM_CONST",12:"STR_CONST",13:"NULL_CONST",14:"SYMBOL",15:"{",17:"}",18:"(",19:")",20:"-",21:"+",22:"!",23:"~",24:"?",25:":",26:"*",27:"/",28:"^",29:"SPECIAL",30:"%",31:"LT",32:"LE",33:"EQ",34:"NE",35:"GE",36:"GT",37:"AND",38:"OR",39:"AND2",40:"OR2",41:"LEFT_ASSIGN",42:"RIGHT_ASSIGN",43:"FUNCTION",47:"IF",49:"ELSE",50:"FOR",52:"WHILE",54:"REPEAT",55:"LBB",56:"]",57:"[",58:"NS_GET",59:"NS_GET_INT",60:"$",61:"@",62:"NEXT",63:"BREAK",64:"IN",66:","},
productions_: [0,[3,1],[3,1],[3,2],[3,2],[3,1],[6,1],[6,1],[9,3],[8,1],[8,1],[8,1],[8,1],[8,3],[8,3],[8,2],[8,2],[8,2],[8,2],[8,2],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,6],[8,4],[8,3],[8,5],[8,3],[8,3],[8,2],[8,5],[8,4],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,1],[8,1],[53,3],[48,3],[51,5],[16,0],[16,1],[16,3],[16,2],[16,3],[16,2],[46,1],[46,4],[65,0],[65,1],[65,2],[65,3],[65,2],[65,3],[65,2],[65,3],[44,0],[44,1],[44,3],[44,3],[44,5],[45,0]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return "EOF";
break;
case 2:
return [];
break;
case 3: case 4:
return $$[$0-1];
break;
case 5:
return "PARSING ERROR";
break;
case 6: case 7: case 9: case 10: case 11: case 12:
 this.$ = $$[$0]; 
break;
case 8:
 this.$ = [$$[$0-1],$$[$0-2],$$[$0]] 
break;
case 13:
 this.$ = [$$[$0-2]].concat($$[$0-1]); 
break;
case 14:
 this.$ = [$$[$0-2]].concat([$$[$0-1]]); 
break;
case 15: case 16: case 17: case 18: case 19: case 48:
 this.$ = [$$[$0-1],$$[$0]]; 
break;
case 20: case 21: case 22: case 23: case 24: case 25: case 26: case 27: case 28: case 29: case 30: case 31: case 32: case 33: case 34: case 35: case 36: case 37: case 38: case 39: case 40: case 51: case 52: case 53: case 54: case 55: case 56: case 57: case 58: case 59: case 60: case 61: case 62:
 this.$ = [$$[$0-1],$$[$0-2],$$[$0]]; 
break;
case 41:
 this.$ = ($$[$0-1] == '->') ? ['<-',$$[$0],$$[$0-2]] : ['<<-',$$[$0],$$[$0-2]]; 
break;
case 42:
 this.$ = [$$[$0-5],$$[$0-3],$$[$0]]; 
break;
case 43:
 this.$ = [$$[$0-3]].concat($$[$0-1]); 
break;
case 44: case 47:
 this.$ = [$$[$0-2],$$[$0-1],$$[$0]]; 
break;
case 45:
 this.$ = [$$[$0-4],$$[$0-3],$$[$0-2],$$[$0]]; 
break;
case 46:
 this.$ = [$$[$0-2]].concat($$[$0-1]).concat([$$[$0]]); 
break;
case 49:
 this.$ = [$$[$0-3],$$[$0-4]].concat($$[$0-2]); 
break;
case 50:
 this.$ = [$$[$0-2],$$[$0-3]].concat($$[$0-1]); 
break;
case 63: case 64: case 69:
 this.$ = [$$[$0]]; 
break;
case 65: case 66: case 71: case 73:
 this.$ = $$[$0-1]; 
break;
case 67:
 this.$ = [$$[$0-3],$$[$0-1]]; 
break;
case 68: case 84:
 this.$ = []; 
break;
case 70: case 72:
 $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 74:
 this.$ = [$$[$0]];	  
break;
case 75:
 this.$ = $$[$0-3].concat([$$[$0]]); 
break;
case 76:
 this.$ = new Object(); 
break;
case 77:
 this.$ = $$[$0];   
break;
case 78: case 80: case 82:
 var x = new Object(); x[$$[$0-1]] = ""; this.$ = x; 
break;
case 79: case 81: case 83:
 var x = new Object(); x[$$[$0-2]] = $$[$0]; this.$ = x; 
break;
case 85:
 var x = new Object(); x[$$[$0]] = ""; this.$ = [x]; 
break;
case 86:
 var x = new Object(); x[$$[$0-2]] = $$[$0]; this.$ = [x]; 
break;
case 87:
 $$[$0-2][0][$$[$0]] = ""; this.$ = $$[$0-2]; 
break;
case 88:
 $$[$0-4][0][$$[$0-2]] = $$[$0]; this.$ = $$[$0-4]; 
break;
}
},
table: [{2:[1,5],3:1,4:[1,2],5:[1,3],6:4,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{1:[3]},{1:[2,1]},{1:[2,2]},{5:[1,26],7:[1,27]},{1:[2,5]},o([5,7,17,19,49,56,66],[2,6],{10:[1,55],18:$Vi,20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($VJ,[2,7]),o($VJ,[2,9]),o($VJ,$VK,{58:$VL,59:$VM}),o($VJ,$VN),o($VJ,$VO,{58:$VP,59:$VQ}),o($VR,[2,68],{8:6,9:7,16:60,6:61,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),{6:62,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:63,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:64,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:65,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:66,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:67,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{18:[1,68]},{18:[1,70],48:69},{18:[1,72],51:71},{18:[1,74],53:73},{6:75,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},o($VJ,[2,63]),o($VJ,[2,64]),{1:[2,3]},{1:[2,4]},{8:76,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:77,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:78,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:79,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:80,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:81,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:82,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:83,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:84,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:85,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:86,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:87,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:88,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:89,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:90,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:91,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:92,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:93,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:94,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:95,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:96,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:97,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},o($VS,$VT,{46:98,65:99,8:100,11:$V0,12:$VU,13:$VV,14:$VW,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),o($VX,$VT,{65:99,8:100,46:104,11:$V0,12:$VU,13:$VV,14:$VW,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),o($VX,$VT,{65:99,8:100,46:105,11:$V0,12:$VU,13:$VV,14:$VW,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),{12:[1,107],14:[1,106]},{12:[1,109],14:[1,108]},{6:110,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{12:[1,112],14:[1,111]},{12:[1,114],14:[1,113]},{12:[1,116],14:[1,115]},{12:[1,118],14:[1,117]},{5:[1,121],7:[1,120],17:[1,119]},o($VR,[2,69]),{19:[1,122]},o($VY,[2,15],{18:$Vi,28:$Vq,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VY,[2,16],{18:$Vi,28:$Vq,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,17],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,55:$VF,57:$VG,60:$VH,61:$VI}),o($V_,[2,18],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,55:$VF,57:$VG,60:$VH,61:$VI}),o($V$,[2,19],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($VS,[2,84],{44:123,14:[1,124]}),{6:125,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:126,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{6:127,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{14:[1,128]},{6:129,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{8:130,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},o($VJ,[2,48]),o($VY,[2,20],{18:$Vi,28:$Vq,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($V01,[2,21],{18:$Vi,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($V01,[2,22],{18:$Vi,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($V11,[2,23],{18:$Vi,25:$Vn,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($V11,[2,24],{18:$Vi,25:$Vn,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VY,[2,25],{18:$Vi,28:$Vq,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o([5,7,10,17,19,20,21,23,24,26,27,29,31,32,33,34,35,36,37,38,39,40,41,42,49,56,66],[2,26],{18:$Vi,25:$Vn,28:$Vq,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o([5,7,10,17,19,49,56,66],[2,27],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($V_,[2,28],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,55:$VF,57:$VG,60:$VH,61:$VI}),o($V$,[2,29],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,30],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,31],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,32],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,33],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,34],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,35],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,36],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,55:$VF,57:$VG,60:$VH,61:$VI}),o($V21,[2,37],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,39:$VB,55:$VF,57:$VG,60:$VH,61:$VI}),o($VZ,[2,38],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,55:$VF,57:$VG,60:$VH,61:$VI}),o($V21,[2,39],{18:$Vi,20:$Vj,21:$Vk,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,39:$VB,55:$VF,57:$VG,60:$VH,61:$VI}),o($V$,[2,40],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o([5,7,10,17,19,24,41,42,49,56,66],[2,41],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,55:$VF,57:$VG,60:$VH,61:$VI}),{19:[1,131],45:132,66:$V31},o($V41,[2,74]),o($V41,[2,77],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($V51,$VO,{10:[1,133],58:$VP,59:$VQ}),o($V51,$VK,{10:[1,134],58:$VL,59:$VM}),o($V51,$VN,{10:[1,135]}),{45:132,56:[1,136],66:$V31},{45:132,56:[1,137],66:$V31},o($VJ,[2,59]),o($VJ,[2,60]),o($VJ,[2,61]),o($VJ,[2,62]),o($VJ,[2,8]),o($VJ,[2,53]),o($VJ,[2,54]),o($VJ,[2,57]),o($VJ,[2,58]),o($VJ,[2,51]),o($VJ,[2,52]),o($VJ,[2,55]),o($VJ,[2,56]),o($VJ,[2,13]),o($VR,[2,71],{8:6,9:7,6:138,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),o($VR,[2,73],{8:6,9:7,6:139,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),o($VJ,[2,14]),{19:[1,140],66:[1,141]},o($VS,[2,85],{10:[1,142]}),o([5,7,10,17,18,19,20,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,55,56,57,60,61,66],[2,44],{49:[1,143]}),{18:$Vi,19:[1,144],20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI},o($VJ,[2,46]),{64:[1,145]},o($VJ,[2,47]),{18:$Vi,19:[1,146],20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI},o($VJ,[2,43]),{66:[1,147]},o($V41,[2,78],{8:148,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),o($V41,[2,80],{8:149,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),o($V41,[2,82],{8:150,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),{56:[1,151]},o($VJ,[2,50]),o($VR,[2,70]),o($VR,[2,72]),o($V61,$V31,{45:152}),{14:[1,153]},{8:154,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},{6:155,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},o($V61,[2,66]),{8:156,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},o($V61,[2,65]),o($V41,$VT,{8:100,65:157,11:$V0,12:$VU,13:$VV,14:$VW,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh}),o($V41,[2,79],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($V41,[2,81],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($V41,[2,83],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($VJ,[2,49]),{6:158,8:6,9:7,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},o($VS,[2,87],{10:[1,159]}),o($VS,[2,86],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI}),o($VJ,[2,45]),{18:$Vi,19:[1,160],20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI},o($V41,[2,75]),o($VJ,[2,42]),{8:161,11:$V0,12:$V1,13:$V2,14:$V3,15:$V4,18:$V5,20:$V6,21:$V7,22:$V8,23:$V9,24:$Va,43:$Vb,47:$Vc,50:$Vd,52:$Ve,54:$Vf,62:$Vg,63:$Vh},o($V61,[2,67]),o($VS,[2,88],{18:$Vi,20:$Vj,21:$Vk,23:$Vl,24:$Vm,25:$Vn,26:$Vo,27:$Vp,28:$Vq,29:$Vr,30:$Vs,31:$Vt,32:$Vu,33:$Vv,34:$Vw,35:$Vx,36:$Vy,37:$Vz,38:$VA,39:$VB,40:$VC,41:$VD,42:$VE,55:$VF,57:$VG,60:$VH,61:$VI})],
defaultActions: {2:[2,1],3:[2,2],5:[2,5],26:[2,3],27:[2,4]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse (input) {
    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    var args = lstack.slice.call(arguments, 1);

    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    // copy state
    for (var k in this.yy) {
      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
        sharedState.yy[k] = this.yy[k];
      }
    }

    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);

    var ranges = lexer.options && lexer.options.ranges;

    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

_token_stack:
    var lex = function () {
        var token;
        token = lexer.lex() || EOF;
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

_handle_error:
        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            var error_rule_depth;
            var errStr = '';

            // Return the rule stack depth where the nearest error rule can be found.
            // Return FALSE when no error recovery rule was found.
            function locateNearestErrorRecoveryRule(state) {
                var stack_probe = stack.length - 1;
                var depth = 0;

                // try to recover from error
                for(;;) {
                    // check for error recovery rule in this state
                    if ((TERROR.toString()) in table[state]) {
                        return depth;
                    }
                    if (state === 0 || stack_probe < 2) {
                        return false; // No suitable error recovery rule available.
                    }
                    stack_probe -= 2; // popStack(1): [symbol, action]
                    state = stack[stack_probe];
                    ++depth;
                }
            }

            if (!recovering) {
                // first see if there's any chance at hitting an error recovery rule:
                error_rule_depth = locateNearestErrorRecoveryRule(state);

                // Report error
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push("'"+this.terminals_[p]+"'");
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == EOF ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected,
                    recoverable: (error_rule_depth !== false)
                });
            } else if (preErrorSymbol !== EOF) {
                error_rule_depth = locateNearestErrorRecoveryRule(state);
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol === EOF || preErrorSymbol === EOF) {
                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                }

                // discard current lookahead and grab another
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            if (error_rule_depth === false) {
                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
            }
            popStack(error_rule_depth);

            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {
            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(lexer.yytext);
                lstack.push(lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                if (ranges) {
                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
                }
                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3:
                // accept
                return true;
        }

    }

    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function(match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex () {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin (condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState (condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 59
break;
case 2:return 58
break;
case 3:return 55
break;
case 4:return 41
break;
case 5:return 42
break;
case 6:return 41
break;
case 7:return 42
break;
case 8:return 40
break;
case 9:return 39
break;
case 10:return 35
break;
case 11:return 32
break;
case 12:return 33
break;
case 13:return 34
break;
case 14:return 10
break;
case 15:return 23
break;
case 16:return 38
break;
case 17:return 37
break;
case 18:return 22
break;
case 19:return 36
break;
case 20:return 31
break;
case 21:return 21
break;
case 22:return 20
break;
case 23:return 26
break;
case 24:return 27
break;
case 25:return 25
break;
case 26:return 28
break;
case 27:return 60
break;
case 28:return 61
break;
case 29:return 18
break;
case 30:return 19
break;
case 31:return 57
break;
case 32:return 56
break;
case 33:return 15
break;
case 34:return 17
break;
case 35:return 24
break;
case 36:return 66
break;
case 37:return 7
break;
case 38:return 5
break;
case 39:return 4
break;
case 40:return 29
break;
case 41:return 11         // hexadecimal: https://stackoverflow.com/questions/9221362/regular-expression-for-a-hexadecimal-number
break;
case 42:return 11
break;
case 43:return 12  // Quoted string: https://stackoverflow.com/questions/2039795/regular-expression-for-a-string-literal-in-flex-lex
break;
case 44:return 12
break;
case 45:return 14
break;
case 46:
switch(yy_.yytext) {
    // Constants
    case "NULL":
        return "NULL_CONST";
    case "NA":           
    case "TRUE":         
    case "FALSE":        
    case "Inf":          
    case "NaN":          
    case "NA_integer_":  
    case "NA_real_":     
    case "NA_character_":
    case "NA_complex_":  
        return 11;
    // keywords
    case "function":
        return 43;
    case "while":               
        return 52;
    case "repeat":              
        return 54;
    case "for":                 
        return 50;
    case "if":                  
        return 47;
    case "in":                  
        return 64;
    case "else":                
        return 49;
    case "next":                
        return 62;
    case "break":               
        return 63;
    default:
        return 14;
} 
break;
}
},
rules: [/^(?:[^\S\r\n]+)/,/^(?::::)/,/^(?:::)/,/^(?:\[\[)/,/^(?:<<-)/,/^(?:->>)/,/^(?:<-)/,/^(?:->)/,/^(?:\|\|)/,/^(?:&&)/,/^(?:>=)/,/^(?:<=)/,/^(?:==)/,/^(?:!=)/,/^(?:=)/,/^(?:~)/,/^(?:\|)/,/^(?:&)/,/^(?:!)/,/^(?:>)/,/^(?:<)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?::)/,/^(?:\^)/,/^(?:\$)/,/^(?:@)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\{)/,/^(?:\})/,/^(?:\?)/,/^(?:,)/,/^(?:;)/,/^(?:\n|\r|(\r\n))/,/^(?:$)/,/^(?:[%][^%]*[%])/,/^(?:0[xX][0-9a-fA-F]+([pP][+-]?[0-9]+)?[iL]?)/,/^(?:(?:[0-9]+(?:[.][0-9]*)?|(?:[.][0-9]+))(?:[eE][+-]?[0-9]+)?[iL]?)/,/^(?:("([^\\\"]|\\.)*"))/,/^(?:('([^\\\']|\\.)*'))/,/^(?:(`([^\\\`]|\\.)*`))/,/^(?:([a-zA-Z]|[.][a-zA-Z._]?)[a-zA-Z0-9._]*)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = gram;
exports.Parser = gram.Parser;
exports.parse = function () { return gram.parse.apply(gram, arguments); };
exports.main = function commonjsMain (args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"_process":9,"fs":7,"path":8}],3:[function(require,module,exports){
var gram = require('./gram.js')
var preprocessor = require('../preprocessor/preprocessor.js')

function parse_exprs(x) {
    return preprocessor(x).map(expr => gram.parse(expr));
}

module.exports = parse_exprs;

},{"../preprocessor/preprocessor.js":6,"./gram.js":2}],4:[function(require,module,exports){
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

},{"lex":1}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
/*
This file puts together "lexer.js" and "preprocess.js" into a single
function call to be used by a function at a higher abstraction level.
*/ 
var {tokenise} = require("./lexer.js");
var {splitPreprocess} = require("./preprocess.js");
function preprocessor(text) {
    if (text === "") {
        text = "\n";  // make empty string consistent with <return>
    }
    return splitPreprocess(tokenise(text));
}
module.exports = preprocessor;

},{"./lexer.js":4,"./preprocess.js":5}],7:[function(require,module,exports){

},{}],8:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":9}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[3])(3)
});
