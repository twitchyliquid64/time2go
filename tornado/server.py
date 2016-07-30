"""NCSSbook server implementation.

Wraps tornado in a nicer interface that allows URLs to be added with a function
rather than needing to be specified to an application constructor. The task
of running the server is also abstracted into a single run() function.

Users write handler functions that accept a response object. This object is
subclassed from tornado's existing RequestHandler class, so all existing
methods from that class may be accessed as necessary. Helper functions for
accessing form fields and files in the response object are provided.

The register() function on the server is used to connect URLs with handler
functions. Regex groups can be used in URLs to capture ordered arguments; the 
handler function for the URL should accept the name number of additional 
arguments as there are regex groups.

For examples, see ncssbook/examples. Hello World is as follows:

from tornado import Server

def index(response):
    response.write("Hello, World!")

if __name__ == "__"main__":
    server = Server()
    server.register("/", index)

"""
import os
import sys

class Server(object):
    def __init__(self, hostname="", port=8888, static="static"):
        if type(hostname) is not str:
            raise ValueError("hostname must be a string")
        if type(port) is not int and port > 0:
            raise ValueError("port must be a positive integer")
        if type(static) is not str:
            raise ValueError("static must be a string")

        self.hostname = hostname
        self.port = port
        self.static = static
        self.handlers = []

    def register(self, path, handler, **kwargs):
        import types
        import tornado.web
        import tornado.websocket

        if type(path) is not str:
            raise ValueError("path must be a string")

        if isinstance(handler, types.FunctionType):
            name = handler.func_name
            max_nargs = handler.func_code.co_argcount
            ndefaults = handler.func_defaults and len(handler.func_defaults) or 0
            min_nargs = max_nargs - ndefaults
            if max_nargs < 1:
                raise TypeError("handler %s must take at least one argument (the request)" % name)

            def check_handler_arguments(handler, groups):
                ngroups = len(groups) 
                nargs = ngroups + 1 # the request object is the first argument
                if nargs > max_nargs or nargs < min_nargs:
                    if min_nargs == max_nargs:
                        args_desc = "%d argument%s" % (min_nargs, min_nargs != 1 and "s" or "") 
                    else:
                        args_desc = "%d to %d arguments" % (min_nargs, max_nargs)
                    groups_desc = "%d group%s" % (ngroups, ngroups != 1 and "s" or "")
                    raise TypeError("handler %s expects %s, but path has %s" % 
                                    (name, args_desc, groups_desc))

            get_handler = kwargs.get('get', handler)
            post_handler = kwargs.get('post', handler)
            put_handler = kwargs.get('put', handler)
            delete_handler = kwargs.get('delete', handler)

            class Handler(tornado.web.RequestHandler):
                def get(self, *args):
                    check_handler_arguments(get_handler, args)
                    get_handler(self, *args)

                def post(self, *args):
                    handler = post_handler
                    method = self.get_field('_method', '')
                    if method.lower() == 'put':
                      handler = put_handler
                    elif method.lower() == 'delete':
                      handler = delete_handler
                    check_handler_arguments(handler, args)
                    handler(self, *args)

                def get_field(self, name, default=None):
                    return self.get_argument(name, default)
                def get_fields(self):
                    return dict([(k, v[-1]) for k, v in self.request.args.iteritems()])
                def get_file(self, name, default=None):
                    if name in self.request.files:
                        field = self.request.files[name][0]
                        return (field["filename"], field["content_type"], field["body"])
                    else:
                        return (None, None, default)
                def get_files(self, name, default=None):
                    if name in self.request.files:
                        return [(f["filename"], f["content_type"], f["body"])
				for f in self.request.files[name]]
                    else:
                        return [(None, None, default)]

            h = Handler
        elif isinstance(handler, (types.ClassType, types.TypeType)) and \
          issubclass(handler, (tornado.web.RequestHandler, tornado.websocket.WebSocketHandler)):
            h = handler
        else:
            raise ValueError("handler must be a function or a RequestHandler class")

        self.handlers.append((path, h))

    def run(self, postbind_cb):
      if os.environ.get("RUN_MAIN") == "true":
        self._actually_run(postbind_cb)
      else:
        try:
          sys.exit(self._restart_with_reloader())
        except KeyboardInterrupt:
          pass
        
    def _restart_with_reloader(self):
      while True:
        args = [sys.executable] + sys.argv
        if sys.platform == "win32":
          args = ['"%s"' % arg for arg in args]
        new_environ = os.environ.copy()
        new_environ["RUN_MAIN"] = "true"
        exit_code = os.spawnve(os.P_WAIT, sys.executable, args, new_environ)
        if exit_code != 3:
		if exit_code != 0:
			yn = raw_input('Server terminated abnormally, restart? [Yn]')
			if not yn or yn.upper() == 'Y':
				continue
		return exit_code

    def _actually_run(self, postbind_cb):

        import logging
        import tornado.options

        logging.getLogger().setLevel(logging.INFO)
        tornado.options.enable_pretty_logging()

        import tornado.web
        import tornado.httpserver
        import tornado.ioloop
        import tornado.autoreload

        import hashlib
        import random
        m = hashlib.md5()
        m.update(str(random.random()) + str(random.random()))
        secret = m.digest()

        app = tornado.web.Application(self.handlers, static_path=self.static, cookie_secret=secret)

        http_server = tornado.httpserver.HTTPServer(app)
        http_server.listen(self.port)
        logging.info("waiting for requests on http://%s:%d" % (self.hostname or "localhost", self.port))
        ioloop = tornado.ioloop.IOLoop.instance()
        tornado.autoreload.start(ioloop)
	postbind_cb()
        ioloop.start()
