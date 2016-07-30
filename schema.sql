

CREATE TABLE stops (
	stopPK SERIAL PRIMARY KEY,
	stop_id VARCHAR(16),
  stop_name VARCHAR(255),
  parent_station VARCHAR(16),
  location_type VARCHAR(128),
  wheelchair_boarding VARCHAR(16),

  lat double precision,
  lon double precision,
  pos GEOMETRY,

	imported TIMESTAMP
);

CREATE TABLE routes (
	routePK SERIAL PRIMARY KEY,
	route_id VARCHAR(16),
	agency_id VARCHAR(16),
	route_short_name VARCHAR(128),
	route_long_name VARCHAR(255),
	route_desc TEXT,
	route_type VARCHAR(16),
	route_color VARCHAR(12),
	route_text_color VARCHAR(12),

	imported TIMESTAMP
)

CREATE TABLE shapeEntries (
	shapeEntryPK SERIAL PRIMARY KEY,
	shape_id VARCHAR(12),
	lat double precision,
	lon double precision,
	sequence VARCHAR(12),
	shape_dist_traveled VARCHAR(6),

	imported TIMESTAMP
)

CREATE TABLE stopTimes (
	stopTimePK SERIAL PRIMARY KEY,
	trip_id VARCHAR(12),
	arrival_time INT,
	departure_time INT,
	stop_id VARCHAR(16),
	stop_sequence VARCHAR(16),
	pickup_type VARCHAR(8),
	drop_off_type VARCHAR(8),
	shape_dist_traveled VARCHAR(12),
	timepoint VARCHAR(12),
	stop_note VARCHAR(100),

	imported TIMESTAMP
)

CREATE TABLE trips (
	tripPK SERIAL PRIMARY KEY,
	route_id VARCHAR(32),
	service_id VARCHAR(32),
	trip_id VARCHAR(32),
	shape_id VARCHAR(32),
	trip_headsign VARCHAR(255),
	direction_id VARCHAR(12),
	block_id VARCHAR(12),
	wheelchair_accessible VARCHAR(8),
	trip_note VARCHAR(255),
	route_direction VARCHAR(255),

	imported TIMESTAMP
)

INSERT INTO shape
SELECT shape_id, ST_ASTEXT(st_makeline(ST_makepoint(lon, lat))) FROM shapeentries GROUP BY shape_id;

CREATE INDEX stop_gidx ON stops USING GIST (pos);
