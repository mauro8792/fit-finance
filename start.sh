#!/bin/bash
echo "🔍 DEBUG - Current directory:"
pwd
echo "🔍 DEBUG - Files in current directory:"
ls -la
echo "🔍 DEBUG - Files in dist directory:"
ls -la dist/
echo "🔍 DEBUG - Starting application..."
node ./dist/main.js
