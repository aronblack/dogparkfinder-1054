#! /bin/bash

# Restores a datastore dump (dbremote.sqlite) into the local datastore
# @author Thomas J Bradley <hey@thomasjbradley.ca>

appcfg.py upload_data --filename=dbremote.sqlite --kind=Park --url=http://192.168.1.58:8080/remote_api .
