#!/bin/bash

k8s_version=$(cat bootstrap_k8s_cluster.sh | grep k8s_version= | head -1 | cut -f2 -d"=")
echo "Downloading kubernetes $k8s_version for OS X"
curl -L -o kubernetes.tar.gz https://github.com/GoogleCloudPlatform/kubernetes/releases/download/v0.14.2/kubernetes.tar.gz
tar -xzvf kubernetes.tar.gz kubernetes/platforms/darwin/amd64
mv -f ./kubernetes/platforms/darwin/amd64/kubectl /usr/local/bin/
mv -f ./kubernetes/platforms/darwin/amd64/kubecfg /usr/local/bin/
# clean up
rm -fr ./kubernetes
rm -fr ./kubernetes.tar.gz