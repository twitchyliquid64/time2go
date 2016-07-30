from tornado import Server
import TemplateAPI
import hashlib, json
import pg8000

conn = pg8000.connect(port=5432,host="govhacktfnsw.cshtalo4ughh.ap-southeast-2.rds.amazonaws.com", user="hackadmin", password="hackingaway", database="tfnsw")



def dummy():
    print "Started"


def indexPage(response):
    response.write(TemplateAPI.render('main.html', response, {}))

def stopsAroundLocation(lat, lon):
    curs = conn.cursor()
    curs.execute("SELECT stop_id, stop_name, ST_Y(pos), ST_X(pos)  FROM stops WHERE ST_DWithin(pos, ST_MakePoint(%s, %s), 0.005) ORDER BY ST_DISTANCE(pos, ST_MakePoint(%s, %s)) LIMIT 30", (lon,lat,lon,lat,))
    result = curs.fetchall()
    curs.close()
    return result

def debugStopsAround(response):
    response.set_header('Content-Type', 'text/plain')
    response.write(json.dumps(stopsAroundLocation(response.get_field("lat"),response.get_field("lon")), indent=4, sort_keys=True))


server = Server('0.0.0.0', 80)
server.register("/", indexPage)
server.register("/debug/stopsAround", debugStopsAround)
server.run(dummy)
