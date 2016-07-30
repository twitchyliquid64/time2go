import Parser
import sys
sys.path.append("../")
TEMPLATE_DIR = 'templates/'

def render(fname, response, context):
	"""
	> TemplateAPI.render(fname, context)

	Renders the file "templates/<fname>" in accordance to the TemplateAPI parser, given context dictionary <context>
	Context dictionary should be a python dictionary, containing key/value pair where key is a string of the name the value can be accessed with in the templates

	Returns a string of the parsed HTML.

	Example Usage:
	TemplateAPI.render('profile.html', {'user': <User object>})
	"""
	return Parser.Template(open(TEMPLATE_DIR+fname).read()).eval(context)
