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
SELECT t.*, s1.stop_id, s2.stop_id
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
    GROUP BY t.tripPK, s1.stop_id, s2.stop_id
    LIMIT 8;
"""

getPolyQ = """
SELECT St_AsText(ST_BUFFER(ST_SetSRID(ST_LineSubstring(s.geom,
        ST_LineLocatePoint(s.geom, s1.pos),
        ST_LineLocatePoint(s.geom, s2.pos)
    ),4283)::geography,25))
FROM
    stops s1,
    stops s2,
    shape s
WHERE
    s.shape_id = %s AND
    s1.stop_id = %s AND s2.stop_id = %s;
"""

getPokeStopsCountQ = """
SELECT COUNT(*) FROM pokestops WHERE st_within(geom, ST_SetSRID(st_geomfromtext('
"""

def dummy():
    print "Started"


def indexPage(response):
    response.write(TemplateAPI.render('main.html', response, {}))

def parseTime(inp,): #return the unix time
    s = inp.split(":")
    r = int(s[0]) * 60 * 60 + int(s[1]) * 60 + int(s[2])
    return r

def isAllowed(x, allowedIDs):
    for id in allowedIDs:
        if id[0] == x[2]:
            return True
    return False

def relevantTrips(sLat, sLon, eLat, eLon):
    lowerTime = parseTime(time.strftime('%H:%M:%S'))
    upperTime = lowerTime + (60 * 60)
    curs = conn.cursor()
    curs.execute(mainQ, (str(lowerTime),str(upperTime),str(sLon),str(sLat),str(eLon),str(eLat),))
    result = curs.fetchall()
    curs.close()
    allowedIDs = allowedServiceIDs()
    result = [x for x in result if isAllowed(x, allowedIDs)]
    output = []
    for x in range(len(result)):
        shapeId, startStop, endStop = result[x][4], result[x][-2], result[x][-1]
        result[x] ={
            'count': getPokeCountAlongPoly(getPoly(shapeId, startStop, endStop)),
            'other': result[x]
        }

    return result

def getPokeCountAlongPoly(polyStr):
    curs = conn.cursor()
    curs.execute(getPokeStopsCountQ + polyStr.replace("'", "''") + "'),4283));")
    result = curs.fetchone()
    curs.close()
    return result

def getPoly(shapeID, startStop, endStop):
    curs = conn.cursor()
    curs.execute(getPolyQ, (shapeID, startStop, endStop,))
    result = curs.fetchone()
    curs.close()
    return result[0]

def stopsAroundLocation(lat, lon):
    curs = conn.cursor()
    curs.execute("SELECT stop_id, stop_name, ST_Y(pos), ST_X(pos)  FROM stops WHERE ST_DWithin(pos, ST_MakePoint(%s, %s), 0.005) ORDER BY ST_DISTANCE(pos, ST_MakePoint(%s, %s)) LIMIT 30", (lon,lat,lon,lat,))
    result = curs.fetchall()
    curs.close()
    return result

def allowedServiceIDs():
    wd = datetime.now().isoweekday()
    q = "KEK"
    if wd == 1:
        q = "monday='1'"
    elif wd == 2:
        q = "tuesday='1'"
    elif wd == 3:
        q = "wednesday='1'"
    elif wd == 4:
        q = "thursday='1'"
    elif wd == 5:
        q = "friday='1'"
    elif wd == 6:
        q = "saturday='1'"
    elif wd == 7:
        q = "sunday='1'"

    curs = conn.cursor()
    q = "SELECT service_id  FROM calendar WHERE " + q + " AND start_date < now() AND end_date > now()"
    curs.execute(q)
    result = curs.fetchall()
    curs.close()
    return result




def debugStopsAround(response):
    response.set_header('Content-Type', 'text/plain')
    response.write(json.dumps(stopsAroundLocation(response.get_field("lat"),response.get_field("lon")), indent=4, sort_keys=True))

def relevantTrips(response):
    response.set_header('Content-Type', 'application/json')
    response.write(json.dumps(relevantTrips(response.get_field("slat"),response.get_field("slon"),response.get_field("elat"),response.get_field("elon")), indent=4, sort_keys=True, default=json_serial))


def debugrelevantTrips(response):
    response.set_header('Content-Type', 'text/plain')
    response.write(json.dumps(relevantTrips(response.get_field("slat"),response.get_field("slon"),response.get_field("elat"),response.get_field("elon")), indent=4, sort_keys=True, default=json_serial))

def debugallowedServiceIDs(response):
    response.set_header('Content-Type', 'text/plain')
    response.write(json.dumps(allowedServiceIDs(), indent=4, sort_keys=True, default=json_serial))


server = Server('0.0.0.0', 80)
server.register("/", indexPage)
server.register("/debug/stopsAround", debugStopsAround)
server.register("/debug/relevantTrips", debugrelevantTrips)
server.register("/debug/serviceIds", debugallowedServiceIDs)
server.register("/relevantTrips", relevantTrips)
server.run(dummy)
