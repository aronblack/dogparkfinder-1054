#!/usr/bin/env python

""" Application global configuration.

  author: Thomas J Bradley <theman@thomasjbradley.ca>
  link: http://thomasjbradley.ca
  copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
"""

import os

if os.environ.get('SERVER_SOFTWARE', '').startswith('Devel'):
  env = 'dev'
elif os.environ.get('SERVER_SOFTWARE', '').startswith('Goog'):
  env = 'prod'
else:
  env = 'unknown'
  
if env == 'dev':
  markerbase = 'http://dev.teletraan.gotdns.com/parkfinder/theme/img/markers/'
else:
  markerbase = 'http://parkfinder.ottawadogblog.ca/theme/img/markers/'

usermarker = markerbase + 'user.png'

map_dimensions = '400x200'
