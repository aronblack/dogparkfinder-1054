#! /usr/bin/env python

""" Cron job for updating the Bayesian ratings

	author: Thomas J Bradley <theman@thomasjbradley.ca>
	link: http://thomasjbradley.ca
	copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
"""

from __future__ import division
import os
import cgi
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from google.appengine.api import memcache
from models import *

class ParksTasksBayesian(webapp.RequestHandler):
  def get(self):
    parksgql = Park.gql('ORDER BY guid DESC')

    amountVotes = 0.0
    totalRating = 0.0
    amountFacilityVotes = 0.0
    totalFacilityRating = 0.0
    amountCleanlinessVotes = 0.0
    totalCleanlinessRating = 0.0
    amountFreindlinessVotes = 0.0
    totalFriendllinessRating = 0.0

    for p in parksgql:
      p.amountVotes = int(max([p.facilityVotesTotal, p.cleanlinessVotesTotal, p.friendlinessVotesTotal]) / 2)

      if p.amountVotes > 0:
        amountVotes += p.amountVotes
        totalRating += p.overallRating

      if p.facilityVotes > 0:
        amountFacilityVotes += p.facilityVotes
        totalFacilityRating += p.facilityRating

      if p.cleanlinessVotes > 0:
        amountCleanlinessVotes += p.cleanlinessVotes
        totalCleanlinessRating += p.cleanlinessRating

      if p.friendlinessVotes > 0:
        amountFreindlinessVotes += p.friendlinessVotes
        totalFriendllinessRating += p.friendlinessRating

    avgVotes = amountVotes / parksgql.count()
    avgTotal = totalRating / parksgql.count()
    avgFacilityVotes = amountFacilityVotes / parksgql.count()
    avgFacilityTotal = totalFacilityRating / parksgql.count()
    avgCleanlinessVotes = amountCleanlinessVotes / parksgql.count()
    avgCleanlinessTotal = totalCleanlinessRating / parksgql.count()
    avgFriendlinessVotes = amountFreindlinessVotes / parksgql.count()
    avgFriendlinessTotal = totalFriendllinessRating / parksgql.count()

    for p in parksgql:
      p.amountVotes = int(max([p.facilityVotesTotal, p.cleanlinessVotesTotal, p.friendlinessVotesTotal]) / 2)

      if p.facilityVotes > 0:
        p.facilityBayesian = int(((avgFacilityVotes * avgFacilityTotal) + (p.facilityVotes * p.facilityRating)) / (avgFacilityVotes + p.facilityVotes))

      if p.cleanlinessVotes > 0:
        p.cleanlinessBayesian = int(((avgCleanlinessVotes * avgCleanlinessTotal) + (p.cleanlinessVotes * p.cleanlinessRating)) / (avgCleanlinessVotes + p.cleanlinessVotes))

      if p.friendlinessVotes > 0:
        p.friendlinessBayesian = int(((avgFriendlinessVotes * avgFriendlinessTotal) + (p.friendlinessVotes * p.friendlinessRating)) / (avgFriendlinessVotes + p.friendlinessVotes))

      if p.amountVotes > 0:
        avg = int(round((p.facilityBayesian + p.cleanlinessBayesian + p.friendlinessBayesian) / 3))
        p.overallBayesian = int(((avgVotes * avgTotal) + (p.amountVotes * avg)) / (avgVotes + p.amountVotes))
        p.put()

    memcache.flush_all()

    self.response.out.write('Done.')
