from tornado import Server
import TemplateAPI
import hashlib, json



def dummy():
    print "Started"


def indexPage(response):
    response.write(TemplateAPI.render('main.html', response, {}))


server = Server('0.0.0.0', 80)
server.register("/", indexPage)
server.run(dummy)
