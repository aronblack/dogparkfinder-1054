#!/usr/bin/env python

"""
  Build script for the application
  @author Thomas J Bradley <hey@thomasjbradley.ca>
"""

import os
from cssmin import *

# Minify Js using Closure Compiler
os.system('java -jar ~/bin/compiler.jar --js js-enhanced/app-enhanced.js --js_output_file js-enhanced/app-enhanced.min.js')
os.system('java -jar ~/bin/compiler.jar --js theme/js/app-basic.js --js_output_file theme/js/app-basic.min.js')


# Prepend the Geo Js file to the start of the app-basic js file
geo = open('theme/js/geo.min.js')
geocontent = geo.read()
geo.close()
js = open('theme/js/app-basic.min.js')
jscontent = js.read()
js.close()

jsw = open('theme/js/app-basic.min.js', 'w')
jsw.write(geocontent + '\n' + jscontent)
jsw.close()


# Minify Css using the Python cssmin egg
csstomin = ['theme/css/basic.css', 'theme/css/enhanced-wide.css', 'theme/css/enhanced.css']

for cssfile in csstomin:
  content = open(cssfile)
  outs = cssmin(content.read())
  content.close()
  fout = open(cssfile.replace('.css', '.min.css'), 'w')
  fout.write(outs + '\n')
  fout.close()
