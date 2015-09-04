from math import sin, cos, asin, sqrt, degrees, radians

# http://stackoverflow.com/questions/3182260/python-geocode-filtering-by-distance
def haversine(angle_radians):
  return sin(angle_radians / 2.0) ** 2

def inverse_haversine(h):
  return 2 * asin(sqrt(h))

def distance_between_points(lat1, lon1, lat2, lon2):
  Earth_radius_km = 6371.0
  RADIUS = Earth_radius_km
  lat1 = radians(lat1)
  lat2 = radians(lat2)
  dlat = lat2 - lat1
  dlon = radians(lon2 - lon1)
  h = haversine(dlat) + cos(lat1) * cos(lat2) * haversine(dlon)
  return RADIUS * inverse_haversine(h)