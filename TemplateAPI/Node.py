import cgi

### NODES ###

class Node(object):
	'''Base Node Class.'''
	def eval(self, context):
		raise NotImplementedError()

class Group(Node):
	'''Node class for grouping a number of elements.'''
	def __init__(self):
		self.children = []

	def add_child(self, child):
		self.children.append(child)

	def eval(self, context):
		result = []
		for i in self.children:
			result.append(i.eval(context))
		return ''.join(result)

class Eval(Node):
	'''Node that evaluates a python expression'''
	def __init__(self, expression):
		self.expression = expression

	def eval(self, context):
		return cgi.escape(str(eval(self.expression, {}, context)), True)

class SafeEval(Eval):
	'''Node that evaluates a python expression and does not escape it'''
	def eval(self, context):
		return str(eval(self.expression, {}, context))


class Text(Node):
	'''Node containing raw HTML code'''
	def __init__(self, text):
		self.text = text

	def eval(self, context):
		return self.text

class If(Node):
	'''Node returning text if a condition evaluates true.'''
	def __init__(self, expression, gtrue, gfalse=None):
		self.expression = expression
		self.gtrue = gtrue
		self.gfalse = gfalse

	def eval(self, context):
		if eval(self.expression, {}, context):
			return self.gtrue.eval(context)
		elif self.gfalse:
			return self.gfalse.eval(context)
		else:
			return ""

class For(Node):
	'''Node that iterates output using a list'''
	def __init__(self, expression, loop, empty=None):
		self.expression = expression
		self.loop = loop
		self.empty = empty

	def eval(self, context):
		result = []
		var, items = self.expression
		items = eval(items, {}, context)
		if len(items) == 0 and self.empty is not None:
		   return self.empty.eval(context)
		for i in xrange(len(items)):
			context[var] = items[i]
			result.append(self.loop.eval(context))
		
		return ''.join(result)


class Include(Node):
	'''Node that includes the specified document, giving context'''
	def __init__(self, template_object):
		self.template_object = template_object

	def eval(self, context):
		return self.template_object.eval(context)

class Let(Node):
	'''Node that modifies a context variable'''
	def __init__(self, expression):
		self.expression = expression

	def eval(self, context):
		item, expression = self.expression
		context[item] = eval(expression, {}, context)
		return ''
