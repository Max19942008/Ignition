#!/usr/bin/env bas

# PRODUCTION DEPLOYMENT SCRIPT

git reset --hard
git checkout master
git pull origin master

docker compose up -d
