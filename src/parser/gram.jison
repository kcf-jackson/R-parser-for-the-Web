/* description: Parses expressions from the R programming language. */

/* lexical grammar */
%lex
%%

[^\S\r\n]+            /* skip whitespace */
":::"                 return 'NS_GET_INT'
"::"                  return 'NS_GET'
"[["                  return 'LBB'
"<<-"                 return 'LEFT_ASSIGN'
"->>"                 return 'RIGHT_ASSIGN'
"<-"                  return 'LEFT_ASSIGN'
"->"                  return 'RIGHT_ASSIGN'
"||"                  return 'OR2'
"&&"                  return 'AND2'
">="                  return 'GE'
"<="                  return 'LE'
"=="                  return 'EQ'
"!="                  return 'NE'
"="                   return 'EQ_ASSIGN'
"~"                   return '~'
"|"                   return 'OR'
"&"                   return 'AND'
"!"                   return '!'
">"                   return 'GT'
"<"                   return 'LT'
"+"                   return '+'
"-"                   return '-'
"*"                   return '*'
"/"                   return '/'
":"                   return ':'
"^"                   return '^'
"$"                   return '$'
"@"                   return '@'
"("                   return '('
")"                   return ')'
"["                   return '['
"]"                   return ']'
"{"                   return '{'
"}"                   return '}'
"?"                   return '?'
// Separators
","                   return ','
";"                   return ';'
\n|\r|(\r\n)          return '\n'
<<EOF>>               return 'END_OF_INPUT'
[%][^%]*[%]           return 'SPECIAL'
0[xX][0-9a-fA-F]+([pP][+-]?[0-9]+)?[iL]?     return 'NUM_CONST'         // hexadecimal: https://stackoverflow.com/questions/9221362/regular-expression-for-a-hexadecimal-number
(?:[0-9]+(?:[.][0-9]*)?|(?:[.][0-9]+))(?:[eE][+-]?[0-9]+)?[iL]?   return 'NUM_CONST'
(\"([^\\\"]|\\.)*\")         return 'STR_CONST'  // Quoted string: https://stackoverflow.com/questions/2039795/regular-expression-for-a-string-literal-in-flex-lex
(\'([^\\\']|\\.)*\')         return 'STR_CONST'
(\`([^\\\`]|\\.)*\`)         return 'SYMBOL'
([a-zA-Z]|[.][a-zA-Z._]?)[a-zA-Z0-9._]*      %{
switch(yytext) {
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
        return 'NUM_CONST';
    // keywords
    case "function":
        return 'FUNCTION';
    case "while":               
        return 'WHILE';
    case "repeat":              
        return 'REPEAT';
    case "for":                 
        return 'FOR';
    case "if":                  
        return 'IF';
    case "in":                  
        return 'IN';
    case "else":                
        return 'ELSE';
    case "next":                
        return 'NEXT';
    case "break":               
        return 'BREAK';
    default:
        return 'SYMBOL';
} %}

/lex

/* operator associations and precedence */

%left		'?'
%left		LOW WHILE FOR REPEAT
%right		IF
%left		ELSE
%right		LEFT_ASSIGN
%right		EQ_ASSIGN
%left		RIGHT_ASSIGN
%left		'~' TILDE
%left		OR OR2
%left		AND AND2
%left		UNOT NOT
%nonassoc   GT GE LT LE EQ NE
%left		'+' '-'
%left		'*' '/'
%left		SPECIAL
%left		':'
%left		UMINUS UPLUS
%right		'^'
%left		'$' '@'
%left		NS_GET NS_GET_INT
%nonassoc	'(' '[' LBB

%start expressions

%% /* language grammar */

expressions 
    : END_OF_INPUT          {return "EOF";}
    | '\n'                  {return [];}
    | expr_or_assign '\n'   {return $1;}
    | expr_or_assign ';'    {return $1;}
    | error                 {return "PARSING ERROR";}
    ;

expr_or_assign 
    : expr                  { $$ = $1; }
    | equal_assign          { $$ = $1; }
    ;

equal_assign 
    : expr EQ_ASSIGN expr_or_assign    { $$ = [$2,$1,$3] }
    ;

expr
    :   NUM_CONST             { $$ = $1; }
    |   STR_CONST             { $$ = $1; }
    |   NULL_CONST            { $$ = $1; }
    |   SYMBOL                { $$ = $1; }

    |	'{' exprlist '}'		{ $$ = [$1].concat($2); }  //var x = [$1]; x.push($2); $$ = x;
    |	'(' expr_or_assign ')'	{ $$ = [$1].concat([$2]); }

    |	'-' expr %prec UMINUS	{ $$ = [$1,$2]; }
    |	'+' expr %prec UMINUS   { $$ = [$1,$2]; }
    |	'!' expr %prec UNOT		{ $$ = [$1,$2]; }
    |	'~' expr %prec TILDE	{ $$ = [$1,$2]; }
    |	'?' expr			    { $$ = [$1,$2]; }

    |   expr ':' expr         { $$ = [$2,$1,$3]; }
    |   expr '+' expr         { $$ = [$2,$1,$3]; }
    |   expr '-' expr         { $$ = [$2,$1,$3]; }
    |   expr '*' expr         { $$ = [$2,$1,$3]; }
    |   expr '/' expr         { $$ = [$2,$1,$3]; }
    |	expr '^' expr 		  { $$ = [$2,$1,$3]; }
    |	expr SPECIAL expr	  { $$ = [$2,$1,$3]; }
    |	expr '%' expr		  { $$ = [$2,$1,$3]; }
    |	expr '~' expr		  { $$ = [$2,$1,$3]; }
    |	expr '?' expr		  { $$ = [$2,$1,$3]; }
    |	expr LT expr		  { $$ = [$2,$1,$3]; }
    |	expr LE expr		  { $$ = [$2,$1,$3]; }
    |	expr EQ expr		  { $$ = [$2,$1,$3]; }
    |	expr NE expr		  { $$ = [$2,$1,$3]; }
    |	expr GE expr		  { $$ = [$2,$1,$3]; }
    |	expr GT expr		  { $$ = [$2,$1,$3]; }
    |	expr AND expr		  { $$ = [$2,$1,$3]; }
    |	expr OR expr		  { $$ = [$2,$1,$3]; }
    |	expr AND2 expr		  { $$ = [$2,$1,$3]; }
    |	expr OR2 expr		  { $$ = [$2,$1,$3]; }

    |	expr LEFT_ASSIGN expr 		{ $$ = [$2,$1,$3]; }
    |	expr RIGHT_ASSIGN expr 		{ $$ = ($2 == '->') ? ['<-',$3,$1] : ['<<-',$3,$1]; }
    |	FUNCTION '(' formlist ')' cr expr_or_assign %prec LOW    { $$ = [$1,$3,$6]; }
    |	expr '(' sublist ')'		{ $$ = [$1].concat($3); }
    |	IF ifcond expr_or_assign 	                    { $$ = [$1,$2,$3]; }
    |	IF ifcond expr_or_assign ELSE expr_or_assign	{ $$ = [$1,$2,$3,$5]; }
    |	FOR forcond expr_or_assign %prec FOR 	        { $$ = [$1].concat($2).concat([$3]); }
    |	WHILE cond expr_or_assign	{ $$ = [$1,$2,$3]; }
    |	REPEAT expr_or_assign		{ $$ = [$1,$2]; }
    |	expr LBB sublist ']' ']'	{ $$ = [$2,$1].concat($3); }
    |	expr '[' sublist ']'		{ $$ = [$2,$1].concat($3); }
    |	SYMBOL NS_GET SYMBOL		{ $$ = [$2,$1,$3]; }
    |	SYMBOL NS_GET STR_CONST		{ $$ = [$2,$1,$3]; }
    |	STR_CONST NS_GET SYMBOL		{ $$ = [$2,$1,$3]; }
    |	STR_CONST NS_GET STR_CONST	{ $$ = [$2,$1,$3]; }
    |	SYMBOL NS_GET_INT SYMBOL	{ $$ = [$2,$1,$3]; }
    |	SYMBOL NS_GET_INT STR_CONST	{ $$ = [$2,$1,$3]; }
    |	STR_CONST NS_GET_INT SYMBOL	{ $$ = [$2,$1,$3]; }
    |	STR_CONST NS_GET_INT STR_CONST	{ $$ = [$2,$1,$3]; }
    |	expr '$' SYMBOL			{ $$ = [$2,$1,$3]; }
    |	expr '$' STR_CONST		{ $$ = [$2,$1,$3]; }
    |	expr '@' SYMBOL			{ $$ = [$2,$1,$3]; }
    |	expr '@' STR_CONST		{ $$ = [$2,$1,$3]; }
    |	NEXT				    { $$ = [$1]; }
    |	BREAK				    { $$ = [$1]; }
    ;

cond	:	'(' expr ')'			{ $$ = $2; }
        ;

ifcond	:	'(' expr ')'			{ $$ = $2; }
        ;

forcond :	'(' SYMBOL IN expr ')' 	{ $$ = [$2,$4]; }
        ;

exprlist:					            { $$ = []; }
    |	expr_or_assign			        { $$ = [$1]; }
    |	exprlist ';' expr_or_assign	    { $1.push($3); $$ = $1; }
    |	exprlist ';'			        { $$ = $1; }
    |	exprlist '\n' expr_or_assign	{ $1.push($3); $$ = $1; }
    |	exprlist '\n'			        { $$ = $1; }
    ;

sublist	:	sub				        { $$ = [$1];	  }
    |	sublist cr ',' sub		    { $$ = $1.concat([$4]); }
    ;

sub	:					            { $$ = new Object(); }
    |	expr				        { $$ = $1;   }
    |	SYMBOL EQ_ASSIGN 		    { var x = new Object(); x[$1] = ""; $$ = x; }
    |	SYMBOL EQ_ASSIGN expr		{ var x = new Object(); x[$1] = $3; $$ = x; }
    |	STR_CONST EQ_ASSIGN 		{ var x = new Object(); x[$1] = ""; $$ = x; }
    |	STR_CONST EQ_ASSIGN expr	{ var x = new Object(); x[$1] = $3; $$ = x; }
    |	NULL_CONST EQ_ASSIGN 		{ var x = new Object(); x[$1] = ""; $$ = x; }
    |	NULL_CONST EQ_ASSIGN expr	{ var x = new Object(); x[$1] = $3; $$ = x; }
    ;

formlist:					                { $$ = []; }
    |	SYMBOL				                { var x = new Object(); x[$1] = ""; $$ = [x]; }
    |	SYMBOL EQ_ASSIGN expr		        { var x = new Object(); x[$1] = $3; $$ = [x]; }
    |	formlist ',' SYMBOL		            { $1[0][$3] = ""; $$ = $1; }
    |	formlist ',' SYMBOL EQ_ASSIGN expr	{ $1[0][$3] = $5; $$ = $1; }
    ;

cr	:			
    ;
