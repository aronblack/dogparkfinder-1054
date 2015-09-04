#! /usr/bin/env python

""" Helps AppEngine convert the CSV to the model and import into BigTable
  Used with db-local-dump-import.sh and db-local-dump-import.sh

  author: Thomas J Bradley <theman@thomasjbradley.ca>
  link: http://thomasjbradley.ca
  copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
"""

from google.appengine.ext import db
from google.appengine.tools import bulkloader

from models import park

class ParkLoader(bulkloader.Loader):
  def __init__(self):
    bulkloader.Loader.__init__(self, 'Park',
    [
      ('guid', lambda x: unicode(x, 'utf-8'))
      ,('name', lambda x: unicode(x, 'utf-8'))
      ,('address', lambda x: unicode(x, 'utf-8'))
      ,('neighbourhood', lambda x: unicode(x, 'utf-8'))
      ,('geolocation', db.GeoPt)
      ,('dogs', bool)
      ,('leashed', bool)
      ,('restrictions', bool)
      ,('notes', lambda x: unicode(x, 'utf-8'))
    ])

loaders = [ParkLoader]
