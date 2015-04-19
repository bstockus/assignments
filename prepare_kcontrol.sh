#!/bin/bash

echo "Setting Path to include kubectl..."
export PATH="${PATH}:/home/core"

echo "Syncing Git Repository..."
cd assignments
git pull
cd ..

echo "Finished"