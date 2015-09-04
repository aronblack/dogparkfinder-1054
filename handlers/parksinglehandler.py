#!/usr/bin/env python
# -*- coding: utf-8 -*-

""" Handles generating the popular page for the application.

  author: Thomas J Bradley <theman@thomasjbradley.ca>
  link: http://thomasjbradley.ca
  copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
"""

import os
import cgi
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from google.appengine.api import memcache
import app
from models import *

class ParkSingleHandler(webapp.RequestHandler):
  def get(self, guid):
    cachename = 'parksingleview' + guid + os.environ['CURRENT_VERSION_ID']

    if app.config.env == 'prod':
      view = memcache.get(cachename)
    else:
      view = None

    if view is None:
      park = Park.gql('WHERE guid = :guid LIMIT 1', guid = guid)[0]
      parkgeo = str(park.geolocation).split(',')
      
      tvars = {
        'config': app.config
        ,'l': app.locale.l
        ,'guid': guid
        ,'park': park
        ,'parklat': parkgeo[0]
        ,'parklng': parkgeo[1]
        ,'marker': park.getmarker()
        ,'rateBoxDisplayDialogue': False
        ,'rateBoxDisplayCancel': False
        ,'rateBoxDisplayRateButton': True
        ,'title': park.name + u' · '
      }

      path = os.path.join(os.path.dirname(__file__), '../views/single.html')
      view = template.render(path, tvars)

      if app.config.env == 'prod':
        memcache.add(cachename, view)

    self.response.out.write(view)
