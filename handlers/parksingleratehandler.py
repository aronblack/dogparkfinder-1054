#!/usr/bin/env python

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

class ParkSingleRateHandler(webapp.RequestHandler):
  def post(self, guid):
    data = {
      'facility': 0
      ,'friendly': 0
      ,'clean': 0
    }

    if len(self.request.get('facility')) > 0:
      facility = int(self.request.get('facility'))

      if facility < 0:
        data['facility'] = 0
      elif facility > 2:
        data['facility'] = 2
      else:
        data['facility'] = facility

    if len(self.request.get('friendly')) > 0:
      friendly = int(self.request.get('friendly'))

      if friendly < 0:
        data['friendly'] = 0
      elif friendly > 2:
        data['friendly'] = 2
      else:
        data['friendly'] = friendly

    if len(self.request.get('clean')) > 0:
      clean = int(self.request.get('clean'))

      if clean < 0:
        data['clean'] = 0
      elif clean > 2:
        data['clean'] = 2
      else:
        data['clean'] = clean

    park = Park.gql('WHERE guid = :guid LIMIT 1', guid = guid)[0]

    park.facilityVotes += data['facility']
    park.facilityVotesTotal += 2
    park.facilityRating = int(round((float(park.facilityVotes) / float(park.facilityVotesTotal)) * 100))
  
    park.friendlinessVotes += data['friendly']
    park.friendlinessVotesTotal += 2
    park.friendlinessRating = int(round((float(park.friendlinessVotes) / float(park.friendlinessVotesTotal)) * 100))

    park.cleanlinessVotes += data['clean']
    park.cleanlinessVotesTotal += 2
    park.cleanlinessRating = int(round((float(park.cleanlinessVotes) / float(park.cleanlinessVotesTotal)) * 100))

    park.overallRating = int(round(float(park.facilityRating + park.friendlinessRating + park.cleanlinessRating) / 3))

    park.put()

    self.redirect('/parks/' + guid)
