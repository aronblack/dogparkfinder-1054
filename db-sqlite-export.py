#! /usr/bin/env python

""" Dumps the parks SQLite Db to a Csv file for importing into Google AppEngine.

  author: Thomas J Bradley <theman@thomasjbradley.ca>
  link: http://thomasjbradley.ca
  copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
"""

import sqlite3

dbconn = sqlite3.connect('ottawaparks.sqlite')
cur = dbconn.cursor()
cur.execute('SELECT * FROM ottawaparks ORDER BY name ASC')

parks = []

for row in cur:
  parks.append('"%s","%s","%s","%s","%s,%s","%s","%s","%s","%s"' % row)

dbconn.close()

f = open('parks.csv', 'w')
f.write('\n'.join(parks).encode('utf-8'))
f.write('\n')
f.close()
