#! /bin/bash

# Exports the database from the local datastore into dblocal.sqlite
# @author Thomas J Bradley <hey@thomasjbradley.ca>

rm dblocal.sqlite
appcfg.py download_data --application=ottawadogparkfinder --kind=Park --url=http://192.168.1.58:8080/remote_api --filename=dblocal.sqlite
