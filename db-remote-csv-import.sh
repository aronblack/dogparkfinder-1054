#! /bin/bash

# Imports the parks CSV into the remote App Engine data store
# @author Thomas J Bradley <hey@thomasjbradley.ca>

appcfg.py upload_data --config_file=bulk-uploader.py --filename=parks.csv --kind=Park .
