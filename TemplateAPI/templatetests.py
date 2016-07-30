import TemplateAPI

class Person(object):
	def __init__(self, name, friends=[]):
		self.name=name
		self.friends = friends

text = TemplateAPI.render('example.html', {'user': Person('<script language="javascript">', [Person('James'), Person('Lorem')])})

f=open('blah.html', 'w')
f.write(text)
f.close()