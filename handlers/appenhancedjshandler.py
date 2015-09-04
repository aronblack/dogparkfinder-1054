#! /usr/bin/env python

""" Handles generating the enhanced javascript files

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

class AppEnhancedJsHandler(webapp.RequestHandler):
  def get(self):
    cachename = 'appenhancedjsview' + os.environ['CURRENT_VERSION_ID']

    if app.config.env == 'prod':
      view = memcache.get(cachename)
      js_file = 'app-enhanced.min.js'
    else:
      view = None
      js_file = 'app-enhanced.js'

    if view is None:

      tvars = {
        'l': app.locale.l
      }

      jq_path = os.path.join(os.path.dirname(__file__), '../js-enhanced/jquery-1.4.4.min.js')
      view = template.render(jq_path, {})

      mm_path = os.path.join(os.path.dirname(__file__), '../js-enhanced/markermanager-1.0.min.js')
      view += template.render(mm_path, {})

      ll_path = os.path.join(os.path.dirname(__file__), '../js-enhanced/latlng.min.js')
      view += template.render(ll_path, {})

      js_path = os.path.join(os.path.dirname(__file__), '../js-enhanced/' + js_file)
      view += template.render(js_path, tvars)

      if app.config.env == 'prod':
        memcache.add(cachename, view)

    self.response.headers['Cache-Control'] = 'max-age=7776000, must-revalidate'
    self.response.headers['Content-Type'] = 'text/javascript'
    self.response.out.write(view)
