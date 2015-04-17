#!/bin/bash

ssh -i ~/.ssh/google_compute_engine -f -nNT -L 4001:127.0.0.1:4001 core@104.197.28.198
export FLEETCTL_TUNNEL="104.197.28.198"
ssh -i ~/.ssh/google_compute_engine -f -nNT -L 8080:127.0.0.1:8080 core@104.197.28.198