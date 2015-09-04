#! /bin/bash

# Launch App for specific IP and clear the datastore
# @author Thomas J Bradley <hey@thomasjbradley.ca>

dev_appserver.py --clear_datastore -a 192.168.1.58 .
