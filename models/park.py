#! /usr/bin/env python

""" Model and helper functions for each Park

	author: Thomas J Bradley <theman@thomasjbradley.ca>
	link: http://thomasjbradley.ca
	copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
"""

from google.appengine.ext import db
import app

class Park(db.Model):
  """ Park model for the App Engine data store. """

  guid = db.StringProperty(required=True)
  name = db.StringProperty(required=True)
  address = db.PostalAddressProperty(required=True)
  neighbourhood = db.StringProperty(required=True)
  geolocation = db.GeoPtProperty(required=True)

  dogs = db.BooleanProperty(default=False)
  leashed = db.BooleanProperty(default=False)
  restrictions = db.BooleanProperty(default=False)
  notes = db.StringProperty(multiline=True)

  overallRating = db.RatingProperty(default=0)
  amountVotes = db.IntegerProperty(default=0)
  overallBayesian = db.RatingProperty(default=0)

  facilityVotes = db.IntegerProperty(default=0)
  facilityVotesTotal = db.IntegerProperty(default=0)
  facilityRating = db.RatingProperty(default=0)
  facilityBayesian = db.RatingProperty(default=0)

  cleanlinessVotes = db.IntegerProperty(default=0)
  cleanlinessVotesTotal = db.IntegerProperty(default=0)
  cleanlinessRating = db.RatingProperty(default=0)
  cleanlinessBayesian = db.RatingProperty(default=0)

  friendlinessVotes = db.IntegerProperty(default=0)
  friendlinessVotesTotal = db.IntegerProperty(default=0)
  friendlinessRating = db.RatingProperty(default=0)
  friendlinessBayesian = db.RatingProperty(default=0)

  def getmarker(self):
    if not self.dogs:
      return app.config.markerbase + 'dogs-no.png'
    else:
      if not self.restrictions:
        if not self.leashed:
          return app.configmarkerbase + 'dogs-free.png'
        else:
          return app.configmarkerbase + 'dogs-leashed.png'
      else:
        return app.configmarkerbase + 'dogs-restrictions.png'

def parkstojson(parks):
  """ Manual generation of the Json data set because GAE doesn't include the json module. """

  parkslist = []

  for park in parks:
    geo = str(park.geolocation).split(',')
    i = [
      '"guid":"%s"' % park.guid,
      '"name":"%s"' % park.name,
      '"address":"%s"' % park.address,
      '"neighbourhood":"%s"' % park.neighbourhood,
      '"geolocation":[%f,%f]' % (float(geo[0]), float(geo[1])),
      '"dogs":%s' % str(park.dogs).lower(),
      '"leashed":%s' % str(park.leashed).lower(),
      '"restrictions":%s' % str(park.restrictions).lower(),
      '"notes":"%s"' % park.notes,
      '"rating":%d' % park.overallRating,
      '"amountVotes":%d' % (max([park.facilityVotesTotal, park.cleanlinessVotesTotal, park.friendlinessVotesTotal]) / 2),
      '"overallBayesian":%d' % park.overallBayesian,
      '"facility":%d' % park.facilityRating,
      '"facilityVotes":%d' % park.facilityVotes,
      '"facilityVotesTotal":%d' % park.facilityVotesTotal,
      '"facilityBayesian":%d' % park.facilityBayesian,
      '"cleanliness":%d' % park.cleanlinessRating,
      '"cleanlinessVotes":%d' % park.cleanlinessVotes,
      '"cleanlinessVotesTotal":%d' % park.cleanlinessVotesTotal,
      '"cleanlinessBayesian":%d' % park.cleanlinessBayesian,
      '"friendliness":%d' % park.friendlinessRating,
      '"friendlinessVotes":%d' % park.friendlinessVotes,
      '"friendlinessVotesTotal":%d' % park.friendlinessVotesTotal,
      '"friendlinessBayesian":%d' % park.friendlinessBayesian
    ]

    p = '"%s":{' % park.guid
    p += ','.join(i)
    p += '}'

    parkslist.append(p)

  parksstring = '{%s}' % ','.join(parkslist)

  return parksstring
