#!/usr/bin/env python

""" Application start up and route handling.

  author: Aron Black <theman@thomasjbradley.ca>
  link: http://thomasjbradley.ca
  copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
"""

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from handlers import *

def main():
  application = webapp.WSGIApplication([
    ('/', IndexHandler)
    ,('/popular', PopularHandler)
    ,('/friendly', FriendlyHandler)
    ,('/clean', CleanHandler)
    ,('/nearby', NearbyHandler)
    ,(r'/parks/([a-z0-9]{13})', ParkSingleHandler)
    ,(r'/parks/([a-z0-9]{13})/rate', ParkSingleRateHandler)
    ,('/parks.js', ParksJsListHandler)
    ,('/app-enhanced.min.js', AppEnhancedJsHandler)
    ,('/tasks/bayesian', ParksTasksBayesian)
  ],debug=True)
  util.run_wsgi_app(application)

if __name__ == '__main__':
  main()
