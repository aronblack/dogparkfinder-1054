#! /bin/bash

# Exports the database from the remote datastore into dbremote.sqlite
# @author Thomas J Bradley <hey@thomasjbradley.ca>

rm dbremote.sqlite
appcfg.py download_data --application=ottawadogparkfinder --kind=Park --url=http://ottawadogparkfinder.appspot.com/remote_api --filename=dbremote.sqlite
