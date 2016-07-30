
from datetime import datetime, timedelta
from threading import Timer
import urllib2
import bisect
import csv
import pg8000

conn = pg8000.connect(port=5432,host="govhacktfnsw.cshtalo4ughh.ap-southeast-2.rds.amazonaws.com", user="hackadmin", password="hackingaway", database="tfnsw")

bus_endpoints = [
    "buses_SMBSC001",
    "buses_SMBSC002",
    "buses_SMBSC003",
    "buses_SMBSC004",
    "buses_SMBSC005",
    "buses_SMBSC006",
    "buses_SMBSC007",
    "buses_SMBSC008",
    "buses_SMBSC009",
    "buses_SMBSC010",
    "buses_SMBSC012",
    "buses_SMBSC013",
    "buses_SMBSC014",
    "buses_SMBSC015",
    "buses_OSMBSC001",
    "buses_OSMBSC002",
    "buses_OSMBSC003",
    "buses_OSMBSC004",
    "buses_OSMBSC005",
    "buses_OSMBSC006",
    "buses_OSMBSC007",
    "buses_OSMBSC008",
    "buses_OSMBSC009",
    "buses_OSMBSC010",
    "buses_OSMBSC011",
    "buses_OSMBSC012",
    "buses_Nightride",
    "buses_Major_Event"
]

def request(url): #make a web request to a specified resource and return the data as a string
    opener = urllib2.build_opener()
    opener.addheaders = [('User-agent', 'Mozilla/5.0')]
    response = opener.open(url)
    return response.read()

def updateRouteData(conn, bus):
    curs = conn.cursor()
    stopsRaw = request("http://api.jxeeno.com/tfnsw/static/schedule/" + bus + "/latest/routes.txt")
    stopReader = csv.DictReader(stopsRaw.split("\n"), delimiter=',', quotechar='"')
    count = 0

    query = "INSERT INTO routes (route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_color,route_text_color, imported) VALUES "
    for row in stopReader:
        count += 1
        row['route_short_name'] = row['route_short_name'].replace("'", "''")
        row['route_long_name'] = row['route_long_name'].replace("'", "''")

        l = " ('" + row['route_id'] + "', '" + row['agency_id'] + "', '" + row['route_short_name'] + "', '"
        l += row['route_long_name'] + "', '" + row['route_desc'] + "', '" + row['route_type'] + "', '"
        l += row['route_color'] + "', '" + row["route_text_color"] + "', now())"
        #print l
        query += "\n" + l + ", "
    if count == 0:
        print "\t\tIgnoring empty set"
        return
    print "\t\texec"
    curs.execute(query[:-2])
    print "\t\tcommit"
    conn.commit()
    print "\t\tdone"
    curs.close()

def updateStopData(conn, bus="buses_SMBSC001"):
    curs = conn.cursor()
    stopsRaw = request("http://api.jxeeno.com/tfnsw/static/schedule/" + bus + "/latest/stops.txt")
    stopReader = csv.DictReader(stopsRaw.split("\n"), delimiter=',', quotechar='"')
    count = 0

    query = "INSERT INTO stops (stop_id,stop_name,parent_station,location_type,wheelchair_boarding,lat,lon,imported,pos) VALUES "
    for row in stopReader:
        count += 1
        row['stop_name'] = row['stop_name'].replace("'", "''")

        l = " ('" + row['stop_id'] + "', '" + row['stop_name'] + "', '" + row['parent_station'] + "', '"
        l += row['location_type'] + "', '" + row['wheelchair_boarding'] + "', '" + row['stop_lat'] + "', '"
        l += row['stop_lon'] + "', now(), ST_MakePoint('" + row["stop_lon"] + "', '" + row['stop_lat'] + "'))"
        #print l
        query += "\n" + l + ", "
    if count == 0:
        print "\t\tIgnoring empty set"
        return
    print "\t\texec"
    curs.execute(query[:-2])
    print "\t\tcommit"
    conn.commit()
    print "\t\tdone"
    curs.close()


print "Route data:"
for bus in bus_endpoints:
    print "\t" + bus
    updateRouteData(conn, bus)

print "Stop data:"
for bus in bus_endpoints:
    print "\t" + bus
    updateStopData(conn, bus)
