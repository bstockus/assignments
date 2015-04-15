#!/bin/bash

#gcloud compute instances create vm-app-1 vm-app-2 vm-app-3 --image https://www.googleapis.com/compute/v1/projects/coreos-cloud/global/images/coreos-alpha-647-0-0-v20150409 --zone us-central1-a --machine-type n1-standard-1 --metadata-from-file user-data=cloud-config-app.yaml

#gcloud compute instances create vm-db-redis --image https://www.googleapis.com/compute/v1/projects/coreos-cloud/global/images/coreos-alpha-647-0-0-v20150409 --zone us-central1-a --machine-type n1-standard-1 --metadata-from-file user-data=cloud-config-db-redis.yaml

#gcloud compute instances create vm-db-mongo --image https://www.googleapis.com/compute/v1/projects/coreos-cloud/global/images/coreos-alpha-647-0-0-v20150409 --zone us-central1-a --machine-type n1-standard-1 --metadata-from-file user-data=cloud-config-db-mongo.yaml

#gcloud compute instances create vm-router --image https://www.googleapis.com/compute/v1/projects/coreos-cloud/global/images/coreos-alpha-647-0-0-v20150409 --zone us-central1-a --machine-type n1-standard-1 --metadata-from-file user-data=cloud-config-router.yaml

