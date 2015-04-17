#!/bin/bash

cd /tmp

# try to remove the repo if it already exists
rm -rf assignments; true

git clone https://github.com/bstockus/assignments.git

cd assignments

npm install

nodejs index.js