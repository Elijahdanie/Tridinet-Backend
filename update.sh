#!/bin/bash

git pull
pm2 reload tridinet
pm2 logs tridinet
