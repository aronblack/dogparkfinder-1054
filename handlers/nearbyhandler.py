#!/usr/bin/env python

""" Handles generating the popular page for the application.

  author: Thomas J Bradley <theman@thomasjbradley.ca>
  link: http://thomasjbradley.ca
  copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
"""

import os
import cgi
import urllib
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from google.appengine.api import memcache
from google.appengine.api import urlfetch
from django.utils import simplejson
import app
from models import *
from helpers import *

class NearbyHandler(webapp.RequestHandler):
  def get(self):
    notExactLoc = False
    loc = self.request.get('l')
    lat = self.request.get('lat')
    lng = self.request.get('lng')
    r = self.request.get('r')

    if r != 'jsonp' and lat == '' and lng == '' and loc != '':
      base = 'http://maps.googleapis.com/maps/api/geocode/json?'

      params =  urllib.urlencode({
        'sensor': 'false'
        ,'region': app.locale.l['region']
        ,'address': loc + app.locale.l['adr_extra']
      })

      response = simplejson.loads(urlfetch.fetch(base + params).content)

      if response['status'] == 'OK':
        lat = response['results'][0]['geometry']['location']['lat']
        lng = response['results'][0]['geometry']['location']['lng']
      else:
        lat = app.locale.l['geo_position_lat']
        lng = app.locale.l['geo_position_lng']
        notExactLoc = True

    if lat == '' or lng == '':
      lat = app.locale.l['geo_position_lat']
      lng = app.locale.l['geo_position_lng']
      notExactLoc = True

    parksgql = Park.gql('ORDER BY overallBayesian DESC')
    parks = []

    for p in parksgql:
      geo = str(p.geolocation).split(',')
      p.distance = distance_between_points(float(lat), float(lng), float(geo[0]), float(geo[1]))
      parks.append(p)

    nearby = sorted(parks, key=lambda x: x.distance)[0:10]
    markers = 'markers=icon:' + app.config.usermarker + '|' + str(lat) + ',' + str(lng)

    for n in nearby:
      geo = str(n.geolocation).split(',')
      markers += '&amp;markers=icon:' + n.getmarker() + '|' + geo[0] + ',' + geo[1]

    tvars = {
      'config': app.config
      ,'l': app.locale.l
      ,'isNearby': True
      ,'nearby': nearby
      ,'markers': markers
    }

    if r == 'jsonp':
      path = os.path.join(os.path.dirname(__file__), '../views/nearby.jsonp')
      self.response.headers['Content-Type'] = 'text/javascript'
    else:
      tvars['loc'] = loc
      tvars['popular'] = parks[0:10]
      tvars['friendly'] = sorted(parks, key=lambda x: x.friendlinessBayesian, reverse=True)[0:10]
      tvars['activeTab'] = 'nearby'
      tvars['rateBoxDisplayDialogue'] = True
      tvars['rateBoxDisplayCancel'] = True
      tvars['title'] = app.locale.l['title_nearby']
      tvars['notExactLoc'] = notExactLoc

      path = os.path.join(os.path.dirname(__file__), '../views/index.html')

    view = template.render(path, tvars)

    self.response.out.write(view)
