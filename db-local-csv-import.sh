#! /bin/bash

# Imports the parks CSV into the local App Engine data store
# @author Thomas J Bradley <hey@thomasjbradley.ca>

appcfg.py upload_data --config_file=bulk-uploader.py --filename=parks.csv --kind=Park --url=http://192.168.1.58:8080/remote_api .
