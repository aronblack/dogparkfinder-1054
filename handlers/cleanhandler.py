#!/usr/bin/env python

""" Handles generating the clean page for the application.

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

class CleanHandler(webapp.RequestHandler):
  def get(self):
    cachename = 'cleanview' + os.environ['CURRENT_VERSION_ID']

    if app.config.env == 'prod':
      view = memcache.get(cachename)
    else:
      view = None

    if view is None:
      parksgql = Park.gql('ORDER BY overallBayesian DESC')
      parks = []

      for p in parksgql:
        parks.append(p)

      tvars = {
        'config': app.config
        ,'l': app.locale.l
        ,'popular': parks[0:10]
        ,'friendly': sorted(parks, key=lambda x: x.friendlinessBayesian, reverse=True)[0:10]
        ,'clean': sorted(parks, key=lambda x: x.cleanlinessBayesian, reverse=True)[0:10]
        ,'activeTab': 'clean'
        ,'title': app.locale.l['title_clean']
        ,'rateBoxDisplayDialogue': True
        ,'rateBoxDisplayCancel': True
      }

      path = os.path.join(os.path.dirname(__file__), '../views/index.html')
      view = template.render(path, tvars)

      if app.config.env == 'prod':
        memcache.add(cachename, view)

    self.response.out.write(view)
