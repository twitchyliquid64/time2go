

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
