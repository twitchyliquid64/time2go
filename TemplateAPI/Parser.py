### IMPORTS ###
import re
import Node

### PARSER ###

TEMPLATE_DIR = 'templates/'

class Template(object):
	'''Builds a node tree'''

	SPLIT_RE = re.compile(r'((?:\{!.+?!\})|(?:\{%.+?%\}))') #Non capturing groups prevent silly re.split output

	MATCH_RE = {
		'SAFEEVAL': re.compile(r'\{%\s*safe\s+(.+)%\}'),
		'EVAL': re.compile(r'\{!(.+)!\}'),
		'IF': re.compile(r'\{%\s*if(.+)\s*%\}'),
		'FOR': re.compile(r'\{%\s*for(.+)\s*%\}'),
		'INCLUDE': re.compile(r'\{%\s*include(.+)\s*%\}'),
		'TEXT': re.compile(r'(?!\{(%|!)).*', re.DOTALL)
	}

	def __init__(self, inp):
		#Split the input text into a useable token list
		self._tokens = re.split(Template.SPLIT_RE, inp)

		#Other vars we'll use along the way
		self._length = len(self._tokens)
		self._cpos = 0

		#Begin parsing
		self.root = self._parse_group()
	
	#Returns True if we've reached the end of the token list
	def end(self):
		return self._cpos == self._length
	
	#Returns token at current position
	def peek(self):
		test = None if self.end() else self._tokens[self._cpos]
		return test
	
	#Move pointer to next position in tokens
	def next(self):
		if not self.end(): self._cpos += 1
	
	def _parse_group(self, end_condition=None):
		group = Node.Group()

		while True:
			#break if we have reached an end condition
			if end_condition:
				if self.peek() == None: break
				if re.match(end_condition, self.peek()): break
			else:
				if self.end(): break


			#shpeedeh >:D
			for name, regex in Template.MATCH_RE.iteritems():
				reg = re.match(regex, self.peek())
				if not reg: continue
				statement = reg.group(1)
				if name == "SAFEEVAL":
					node = Node.SafeEval(statement.strip())
				elif name == "EVAL":
					node = Node.Eval(statement.strip())
				
				elif name == "IF":
					self.next()
					node = self._parse_if(statement.strip())
				
				elif name == "FOR":
					self.next()
					node = self._parse_for(statement.strip())
					
				elif name == "INCLUDE":
					node = Template(open(TEMPLATE_DIR+statement.strip()).read())

				elif name == "TEXT":
					node = Node.Text(self.peek())
			
			group.add_child(node)
			
			self.next()
		
		return group

	IF_MATCH = re.compile(r'(\{%\s*else\s*%\})|(\{%\s*end\s+if\s*%\})')
	def _parse_if(self, expression):
		gtrue = self._parse_group(Template.IF_MATCH)
		if re.match(r'\{%\s*else\s*%\}', self.peek()): #if there is an else condtion
			self.next()
			gfalse = self._parse_group(Template.IF_MATCH)
		else:
			gfalse = None
		return Node.If(expression, gtrue, gfalse)
	
	FOR_END = re.compile(r'(\{%\s*empty\s*%\})|(\{%\s*end\s+for\s*%\})')
	def _parse_for(self, expression):
		loop = self._parse_group(Template.FOR_END)
		if re.match(r'\{%\s*empty\s*%\}', self.peek()):
			self.next()
			empty = self._parse_group(Template.FOR_END)
		else:
			empty = None
		a,b = expression.split('in')
		return Node.For((a.strip(), b.strip()), loop, empty)

	
	#Returns the evaluates HTML string
	def eval(self, context):
		return self.root.eval(context)
