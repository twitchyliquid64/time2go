
var TOKEN_NUMBER = "NUM";
var TOKEN_IDENTIFIER = "IDENT";
var TOKEN_STRING = "STRING";
var TOKEN_OPENING_PARENTHESIS = "(";
var TOKEN_CLOSING_PARENTHESIS = ")";
var TOKEN_SEPARATOR = ",";
var TOKEN_KEY = "KEY";
var TOKEN_ASSIGN = "ASSIGN";
var TOKEN_DEREF = "DEREF";
var TOKEN_NEWLINE = "NL";
var TOKEN_JSEXP = "JS_EXP";

function newTokenObject(tokenType, tokenParam, keys){
	var ret = new Object();
	ret.is = "TOKEN";
	ret.ttype = tokenType;
	ret.param = tokenParam;
	ret.values = keys;
	return ret;
}

function isLetter(ch) {
	var code = ch.charCodeAt(0);
	if ( ((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122)))
		return true;
	//if (code == "-".charCodeAt(0))return true;
  if (code == '_'.charCodeAt(0))return true;
	return false;
}

function isNumberChar(ch) {
	var code = ch.charCodeAt(0);
	if ((code >= 48) && (code <= 57))
		return true;
	return false;
}






function lex(rawContent){
	var outputTokens = [];

	for (var i = 0; i < rawContent.length; i++) //loop through each character
	{
		console.log(i, rawContent[i]);
		if ((!isNaN(parseFloat(rawContent[i]))) || (rawContent[i]=="-")) {	//if its not an invalid number (its a number) OR its a minus
			var buff = "";

			if (rawContent[i]=="-"){
				buff = "-";
				i++;
			}

			var isFloat = false;
			while (!isNaN(parseFloat(rawContent[i]))) {
				buff += rawContent[i];
				i++;
			}
			if (rawContent[i] == ".") {
				isFloat = true;
				buff += rawContent[i];
				i++;
				while (!isNaN(parseFloat(rawContent[i]))) {
					buff += rawContent[i];
					i++;
				}
			}
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_NUMBER, parseFloat(buff), {'isFloat': isFloat});
			i--;
		} else if (isLetter(rawContent[i])) {	//if it is a letter
			var buff = "";
			while ((i < rawContent.length) && (isLetter(rawContent[i]) || isNumberChar(rawContent[i]))) {
				buff += rawContent[i];
				i++;
			}
			while(rawContent[i]==" ")i++; //advance whitespace
			if (rawContent[i] == ":" && (rawContent[i+1] != "=")){
				outputTokens[outputTokens.length] = newTokenObject(TOKEN_KEY, buff);
				i++;
			} else {
				outputTokens[outputTokens.length] = newTokenObject(TOKEN_IDENTIFIER, buff);
			}
			i--;
		} else if ((rawContent[i] == '"') || (rawContent[i] == "'")) {
			i++;
			var buff = "";
			while ((rawContent[i] != '"') && (rawContent[i] != "'")) {
				buff += rawContent[i];
				i++;
			}
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_STRING, buff);
		} else if (rawContent[i] == TOKEN_OPENING_PARENTHESIS) {
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_OPENING_PARENTHESIS, "(");
		} else if (rawContent[i] == TOKEN_CLOSING_PARENTHESIS) {
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_CLOSING_PARENTHESIS, ")");
		} else if (rawContent[i] == TOKEN_SEPARATOR) {
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_SEPARATOR, ",");
		} else if (rawContent[i] == '\n') {
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_NEWLINE, "NL");
		} else if (rawContent[i] == ".") {
			i++;
			var buff = "";
			while ((i < rawContent.length) && (isLetter(rawContent[i]))) {
				buff += rawContent[i];
				i++;
			}
			i--;
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_DEREF, buff);
		} else if ((rawContent[i] == ":") && (rawContent[i+1] == "=")) {
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_ASSIGN, "=");
			i++;
		} else if (rawContent[i] == "[") {
			var exp = '';
			i++;
			while ((i < rawContent.length) && (rawContent[i] != ']')) {
				exp += rawContent[i];
				i++;
			}
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_JSEXP, exp);
		}else {
			console.log("Unparsed character:", rawContent[i]);
		}
	}

	printTokens(outputTokens);
	return outputTokens;
};



function printTokens(outputTokens) {
	for (var i = 0; i < outputTokens.length; i++) {
		console.log(outputTokens[i]);
	}
}
