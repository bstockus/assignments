#!/bin/bash

ssh-add ~/.ssh/google_compute_engine &>/dev/null

export ROUTER_IP="104.154.87.60"

# SET
# path to the bin folder where we store our binary files
export PATH=${HOME}/k8s-bin:$PATH
# fleet tunnel
export FLEETCTL_TUNNEL="104.154.87.60"
export FLEETCTL_STRICT_HOST_KEY_CHECKING=false
# etcd
ssh -f -nNT -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -L 4001:127.0.0.1:4001 core@${ROUTER_IP}
# k8s master
ssh -f -nNT -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -L 8080:127.0.0.1:8080 core@${ROUTER_IP}

/bin/zsh
