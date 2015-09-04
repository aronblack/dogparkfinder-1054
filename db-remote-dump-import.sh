#! /bin/bash

# Restores a datastore dump (dblocal.sqlite) into the remote datastore
# @author Thomas J Bradley <hey@thomasjbradley.ca>

appcfg.py upload_data --filename=dblocal.sqlite --kind=Park .
