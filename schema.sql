

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
