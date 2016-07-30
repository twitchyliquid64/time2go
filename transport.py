
from datetime import datetime, timedelta
from threading import Timer
import urllib2
import bisect
import csv

stops = {}
trips = {}
allHomeEntriesByTime = []

stops_we_care_about = [
    "Ashfield",
    "Summer Hill",
    "Redfern",
    "Newtown"
]
home_stop = "Ashfield Station Platform 3"
home_stop_short = "Ashfield Station"




class StopEntry(object):
    def __init__(self, stopId, arrivalTime, tripId, departTime=""):
        self.stopId = stopId
        self.arrivalTime = int(parseTime(arrivalTime, tripId))
        self.tripId = tripId
        self.departTimeLit = departTime
    def __lt__(self, other):
        return self.arrivalTime < other.arrivalTime
    def __repr__(self):
        return 'StopEntry({})'.format(datetime.fromtimestamp(self.arrivalTime).strftime('%dth %H:%M:%S'))








def doCareAboutStop(stopID): #returns true if the stopID submatches to a stop in stops_we_care_about
    stop = stops[stopID]
    for s in stops_we_care_about:
        if s.upper() in stop['stop_name'].upper():
            return True
    return False

def addToLookup(entry):
    global allHomeEntriesByTime, trips
    if entry.tripId in trips:
        return
    if home_stop.upper() in stops[entry.stopId]['stop_name'].upper():
        testExistsIndex = bisect.bisect_left(allHomeEntriesByTime, entry)
        if testExistsIndex < len(allHomeEntriesByTime) and allHomeEntriesByTime[testExistsIndex].tripId == entry.tripId:
            return
        bisect.insort(allHomeEntriesByTime, entry)






def parseDate(tripID):
    if tripID == "":
        return datetime.utcnow()
    s = tripID.split(".")[3].split("-")[1]
    r = datetime.utcnow()
    r = r.replace(year=int(s[0:4]), month=int(s[4:6]), day=int(s[6:8]))
    return r

def parseTime(inp, tripID): #return the unix time
    s = inp.split(":")
    r = parseDate(tripID)
    if int(s[0]) > 23:
        s[0] = int(s[0]) - 24
        r += timedelta(days=1)
    r = r.replace(hour=int(s[0]), minute=int(s[1]), second=int(s[2]))
    return (r-datetime(1970,1,1)).total_seconds()

def request(url): #make a web request to a specified resource and return the data as a string
    opener = urllib2.build_opener()
    opener.addheaders = [('User-agent', 'Mozilla/5.0')]
    response = opener.open(url)
    return response.read()









def _updateStopData():
    global stops, trips

    stopsRaw = request("http://api.jxeeno.com/tfnsw/static/schedule/sydneytrains/latest/stops.txt")
    stopReader = csv.DictReader(stopsRaw.split("\n"), delimiter=',', quotechar='"')
    newStopDict = dict()
    for row in stopReader:
        newStopDict[row['stop_id']] = row
    stops = newStopDict


def updateData():
    global stops, trips
    _updateStopData()

    stopTimesRaw = request("http://api.jxeeno.com/tfnsw/static/schedule/sydneytrains/latest/stop_times.txt")
    stopTimesReader = csv.DictReader(stopTimesRaw.split("\n"), delimiter=',', quotechar='"')
    newTripsDict = {}

    for row in stopTimesReader:
        if doCareAboutStop(row['stop_id']):
            entry = StopEntry(row['stop_id'], row['arrival_time'], row['trip_id'], row['departure_time'])
            if row['trip_id'] in newTripsDict:
                bisect.insort(newTripsDict[row['trip_id']], entry)
            else:
                newTripsDict[row['trip_id']] = [entry]
            addToLookup(entry)
    trips = merge_two_dicts(trips, newTripsDict)
    deleteOldFromTrips()
    deleteOldFromHomeEntries()

def deleteOldFromTrips():
    global trips
    for tripId in trips.keys():
        d = parseDate(tripId)
        d += timedelta(days=1.2)
        if d < datetime.utcnow():
            del trips[tripId]

def deleteOldFromHomeEntries():
    global allHomeEntriesByTime
    new = []
    for stopEntry in allHomeEntriesByTime:
        d =  datetime.fromtimestamp(stopEntry.arrivalTime) + timedelta(days=1.2)
        if d >= datetime.utcnow():
            pass
        else:
            new.append(stopEntry)



def merge_two_dicts(x, y):
    '''Given two dicts, merge them into a new dict as a shallow copy.'''
    z = x.copy()
    z.update(y)
    return z


def buildStopInfoDescriptor(entry):
    ret = {}
    ret['stopID'] = entry.stopId
    ret['stopName'] = stops[entry.stopId]['stop_name']
    if len(stops[entry.stopId]['parent_station']) > 0:
        ret['stopName'] = stops[stops[entry.stopId]['parent_station']]['stop_name']
        ret['platformName'] = stops[entry.stopId]['stop_name']
    ret['arrivalTime'] = entry.arrivalTime
    ret['arrivalTimeLit'] = datetime.fromtimestamp( entry.arrivalTime ).strftime('%H:%M:%S')
    return ret

def buildTripInfoDescriptor(tripID):
    stops = trips[tripID]
    ret = {'id': tripID, 'stops': [], 'indexByStopName': {}}
    for stop in stops:
        s = buildStopInfoDescriptor(stop)
        ret['stops'].append(s)
        ret['indexByStopName'][s['stopName']] = len(ret['stops'])-1
    ret['homeStopIndex'] = ret['indexByStopName'][home_stop_short]
    return ret




def upComingTrains(secondsBefore=120, secondsAfter=2000):
    left = StopEntry("", "11:11:11", "")
    left.arrivalTime = (datetime.utcnow()-datetime(1970,1,1)).total_seconds() - secondsBefore
    right = StopEntry("", "11:11:11", "")
    right.arrivalTime = (datetime.utcnow()-datetime(1970,1,1)).total_seconds() + secondsAfter

    minidx = bisect.bisect_left(allHomeEntriesByTime, left)
    maxidx = bisect.bisect_left(allHomeEntriesByTime, right)

    #print minidx, maxidx, len(allHomeEntriesByTime)

    subset = []
    tempLookup = {}
    for item in allHomeEntriesByTime[minidx:maxidx]:
        if stops[item.stopId]['stop_name'] != home_stop:
            continue
        if item.tripId in tempLookup:
            continue
        if item.arrivalTime not in tempLookup:
            subset.append(item)
            tempLookup[item.arrivalTime] = True
            tempLookup[item.tripId] = True

    if maxidx == len(allHomeEntriesByTime):
        return []

    if minidx == maxidx:
        return [buildTripInfoDescriptor(allHomeEntriesByTime[minidx].tripId)]

    return [buildTripInfoDescriptor(x.tripId) for x in subset]









def test():
    updateData()
    for train in custom_get_next():
        print train[0], train[1], train[3]

def testDelete():
    print "updating..."
    updateData()
    print len(trips), len(allHomeEntriesByTime)
    print "updating..."
    updateData()
    print len(trips), len(allHomeEntriesByTime)

def periodic_updater_worker():
    import time
    updateData()
    while True:
        time.sleep(60 * 60 * 12)
        updateData()

def init():
    import thread
    thread.start_new_thread(periodic_updater_worker, ())






def custom_get_next():
    ret = []
    for train in upComingTrains(150, 3000):
        stopStr = ""
        for stop in train['stops']:
            stopStr += stop['stopName'] + " -> "
        stopStr = stopStr[:-4]
        isExpress = True
        if "Ashfield Station -> Summer Hill Station" in stopStr:
            isExpress = False
        ret.append([train['stops'][train['homeStopIndex']]['arrivalTimeLit'], isExpress, train['id'], stopStr, train])
    return ret

#testDelete()
#test()
# x=datetime.today()
# y=x.replace(day=x.day+1, hour=1, minute=0, second=0, microsecond=0)
# delta_t=y-x
# secs=delta_t.seconds+1
# t = Timer(secs, updateData)
# t.start()
