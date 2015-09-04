#! /usr/bin/env python

""" Handles generating the parks Javascript file.

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

class ParksJsListHandler(webapp.RequestHandler):
  def get(self):
    cachename = 'parkjslistview' + os.environ['CURRENT_VERSION_ID']

    if app.config.env == 'prod':
      view = memcache.get(cachename)
    else:
      view = None

    if view is None:
      parks = Park.gql('ORDER BY overallBayesian DESC')
      tvars = {
        'parks': parkstojson(parks)
      }
      path = os.path.join(os.path.dirname(__file__), '../js-enhanced/parks.js')
      view = template.render(path, tvars)

      if app.config.env == 'prod':
        memcache.add(cachename, view)

    self.response.headers['Content-Type'] = 'text/javascript'
    self.response.out.write(view)
