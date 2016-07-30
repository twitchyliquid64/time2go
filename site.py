from tornado import Server
import TemplateAPI
import hashlib, json
import pg8000
import time

conn = pg8000.connect(port=5432,host="govhacktfnsw.cshtalo4ughh.ap-southeast-2.rds.amazonaws.com", user="hackadmin", password="hackingaway", database="tfnsw")


from datetime import datetime

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime):
        serial = obj.isoformat()
        return serial
    raise TypeError ("Type not serializable")

mainQ = """
SELECT t.*
    FROM
        stops s1, stops s2,
        stoptimes st2,stoptimes st1,
        trips t
    WHERE
        st1.stop_sequence < st2.stop_sequence AND
        st1.departure_time > %s AND
        st1.departure_time < %s AND
        st2.stop_id = s2.stop_id AND
        st1.trip_id = st2.trip_id AND
        st1.stop_id = s1.stop_id AND
        ST_DWithin(
            s1.pos,
            ST_MakePoint(%s,%s),
            0.005
        ) AND ST_DWithin(
            s2.pos,
            ST_MakePoint(%s,%s),
            0.005
        ) AND
        t.trip_id = st1.trip_id
    GROUP BY t.tripPK;
"""


def dummy():
    print "Started"


def indexPage(response):
    response.write(TemplateAPI.render('main.html', response, {}))

def parseTime(inp,): #return the unix time
    s = inp.split(":")
    r = int(s[0]) * 60 * 60 + int(s[1]) * 60 + int(s[2])
    return r


def relevantTrips(sLat, sLon, eLat, eLon):
    lowerTime = parseTime(time.strftime('%H:%M:%S'))
    upperTime = lowerTime + (60 * 60)
    curs = conn.cursor()
    curs.execute(mainQ, (str(lowerTime),str(upperTime),str(sLon),str(sLat),str(eLon),str(eLat),))
    result = curs.fetchall()
    curs.close()
    return result

def stopsAroundLocation(lat, lon):
    curs = conn.cursor()
    curs.execute("SELECT stop_id, stop_name, ST_Y(pos), ST_X(pos)  FROM stops WHERE ST_DWithin(pos, ST_MakePoint(%s, %s), 0.005) ORDER BY ST_DISTANCE(pos, ST_MakePoint(%s, %s)) LIMIT 30", (lon,lat,lon,lat,))
    result = curs.fetchall()
    curs.close()
    return result

def debugStopsAround(response):
    response.set_header('Content-Type', 'text/plain')
    response.write(json.dumps(stopsAroundLocation(response.get_field("lat"),response.get_field("lon")), indent=4, sort_keys=True))

def debugrelevantTrips(response):
    response.set_header('Content-Type', 'text/plain')
    response.write(json.dumps(relevantTrips(response.get_field("slat"),response.get_field("slon"),response.get_field("elat"),response.get_field("elon")), indent=4, sort_keys=True, default=json_serial))


server = Server('0.0.0.0', 80)
server.register("/", indexPage)
server.register("/debug/stopsAround", debugStopsAround)
server.register("/debug/relevantTrips", debugrelevantTrips)
server.run(dummy)
