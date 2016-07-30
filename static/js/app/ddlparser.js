




var AST_ROOT = "ROOT";
var AST_DESCRIPTOR = "DESC"; //function call / object
var AST_NUMBER_LIT = "NUMBER";
var AST_STRING_LIT = "STRING";
var AST_IDENTIFIER = "IDENTIFIER";
var AST_KEY_VAL_LIT = "KEY_VAL";
var AST_ASSIGNMENT = "ASSIGN";
var AST_DEREF = "DEREF";
var AST_JS_EXP = "JS_EXP";

function newNode(name){
	var ret = new Object();
	ret.namedChildren = {};
	ret.unnamedChildren = [];
	ret.nodeName = name;

	ret.lastName = null;
	ret.add = function(name, node){
		if (node == null)return;
		ret.lastName = name;
		if(name == null){
			ret.unnamedChildren[ret.unnamedChildren.length] = node;
		} else {
			ret.namedChildren[name] = node;
		}
	}
	ret.exec = function(outputContext){
		ddlExec(outputContext, this);
	}
	ret.fetchForNonLinearPrecedence = function(){
		if (ret.lastName == null){
			return ret.unnamedChildren.pop();
		}
		var t = ret.namedChildren[ret.lastName];
		//delete ret.namedChildren[ret.lastName];
		return t;
	}
	return ret;
}

function run(){
	var toks = lex(document.getElementById("rawcontent").value);
	var rootNode = ddlParse(toks);
	console.log(rootNode);
	rootNode.exec(newOutputContext());
}

function ddlParse(toks) {
	var rootNode = newNode(AST_ROOT);
	var i = 0;

	while (i < toks.length) {
		var n = recursiveParse(toks, i);
		if (n != null && n != undefined) {
			rootNode.add(n.nodeName, n.obj);
			i = n.pos;
		} else {
			i++;
		}
	}
	return rootNode;
}

function recursiveParse( tokenSet, tokenPosition) {
	for (var i = tokenPosition; i < tokenSet.length; i++) {

		if (tokenSet[i].ttype == TOKEN_IDENTIFIER) {
			if( ((i+1) < tokenSet.length) && (tokenSet[i+1].ttype == TOKEN_OPENING_PARENTHESIS)) {//new descriptor
				var descriptor_name = tokenSet[i].param;
				var retNode = newNode(AST_DESCRIPTOR);
				i += 2;
				while ((i < tokenSet.length) && (tokenSet[i].ttype != TOKEN_CLOSING_PARENTHESIS)){//call recursive_parse until we hit closing parenthesis
					console.log("STARTING ", i, tokenSet[i]);
					var r = recursiveParse(tokenSet, i);
					i = r.pos + ((tokenSet[i].ttype == TOKEN_KEY)? -1 : 0);
					if (r.nonLinearPrecedence) { //we need to wrap the last AST element in the new one.
						var prevNode = retNode.fetchForNonLinearPrecedence();
						if (retNode.lastName == null) {//unordered entry
							r.obj.add(retNode.lastName, prevNode);
						} else {//named entry - add it to child KEY_VAL
							var containerNode = prevNode.fetchForNonLinearPrecedence();
							oldName = prevNode.lastName;
							prevNode.add(containerNode.lastName, r.obj);
							r.obj.add(oldName, containerNode);
						}
					}
					if (retNode.lastName == null || !r.nonLinearPrecedence)retNode.add(r.nodeName, r.obj);
				}

				retNode.value = descriptor_name;
				return {obj: retNode, pos: i+1, nodeName: null};
			} else if( ((i+1) < tokenSet.length) && (tokenSet[i+1].ttype == TOKEN_ASSIGN)) {//assignment
				var descriptor_name = tokenSet[i].param;
				var retNode = newNode(AST_ASSIGNMENT);
				i += 2;

				while ((i < tokenSet.length) && ((tokenSet[i].ttype != TOKEN_CLOSING_PARENTHESIS) && (tokenSet[i].ttype != TOKEN_NEWLINE))){//call recursive_parse until we hit closing parenthesis
					var r = recursiveParse(tokenSet, i);
					i = r.pos;
					if (r.nonLinearPrecedence) { //we need to wrap the last AST element in the new one.
						var prevNode = retNode.fetchForNonLinearPrecedence();
						if (retNode.lastName == null) {//unordered entry
							r.obj.add(retNode.lastName, prevNode);
						} else {//named entry - add it to child KEY_VAL
							var containerNode = prevNode.fetchForNonLinearPrecedence();
							oldName = prevNode.lastName;
							prevNode.add(containerNode.lastName, r.obj);
							r.obj.add(oldName, containerNode);
						}
					}
					if (retNode.lastName == null || !r.nonLinearPrecedence)retNode.add(r.nodeName, r.obj);
				}

				retNode.value = descriptor_name;
				return {obj: retNode, pos: i+1, nodeName: null};
			} else { //not a function call, must be a literal
				var retNode = newNode(AST_IDENTIFIER);
				retNode.value = tokenSet[i].param;
				return {obj: retNode, pos: i+1, nodeName: null};
			}
		}

		else if (tokenSet[i].ttype == TOKEN_NUMBER) {
			var retNode = newNode(AST_NUMBER_LIT);
			retNode.value = tokenSet[i].param;
			return {obj: retNode, pos: i+1, nodeName: null};
		}

		else if (tokenSet[i].ttype == TOKEN_STRING) {
			var retNode = newNode(AST_STRING_LIT);
			retNode.value = tokenSet[i].param;
			return {obj: retNode, pos: i+1, nodeName: null};
		}

		else if (tokenSet[i].ttype == TOKEN_KEY) {
			var retNode = newNode(AST_KEY_VAL_LIT);
			var keyName = tokenSet[i].param;
			i += 1;
			var r = recursiveParse(tokenSet, i); //call recursive parse to parse the value
			i = r.pos;
			retNode.add(r.nodeName, r.obj);
			return {obj: retNode, pos: i+1, nodeName: keyName};
		}

		else if (tokenSet[i].ttype == TOKEN_DEREF) {
			var retNode = newNode(AST_DEREF);
			retNode.value = tokenSet[i].param;
			return {obj: retNode, pos: i+1, nodeName: null, nonLinearPrecedence: true};
		}

		else if (tokenSet[i].ttype == TOKEN_SEPARATOR) {
			return {obj: null, pos: i+1, nodeName: null};
		}else if (tokenSet[i].ttype == TOKEN_JSEXP) {
			var retNode = newNode(AST_JS_EXP);
			retNode.value = tokenSet[i].param;
			return {obj: retNode, pos: i+1, nodeName: null};
		}else if (tokenSet[i].ttype == TOKEN_NEWLINE) {
			return {obj: null, pos: i+1, nodeName: null};
		} else {
			console.log("Parse hit unparsed token: ", tokenSet[i]);
			return {obj: null, pos: i+1, nodeName: null};
		}

	}
}
