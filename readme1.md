# RedisDB

***

# About

The Opstree Redis Operator for Redis automates the creation, modification, or deletion of items in your Redis Cluster environment. The Operator contains the necessary Kubernetes settings to maintain a consistent Redis server for the cluster instance.

We use helm charts provided by Opstree/Redis Operator for setup of RedisDB.<br>

[https://github.com/OT-CONTAINER-KIT/redis-operator/blob/master/README.md](https://github.com/OT-CONTAINER-KIT/redis-operator/blob/master/README.md)

## Design overview

![OT-Container-Kit Architecure](https://github.com/OT-CONTAINER-KIT/redis-operator/blob/master/static/redis-operator-architecture.png?raw=true)<br>

You can get to know more about it by refering to link given below:<br>

[https://ot-redis-operator.netlify.app/docs/overview/](https://ot-redis-operator.netlify.app/docs/overview/)

# Installation

Here's a sequence of steps to follow:

* Add the Redis Helm charts repository from mmp-orchestration
  - Chart dir `mmp-orchestration/mmp-db/mmp-helm-charts/mmp/charts`
* Setup Order:
  - Redis Operator
  - Redis Cluster

##### Redis Operator Configuration

1. To configure repository like aws ecr set image_repository in mmp/values as shown below

```
global:
  image_repository: "devopsartifact.jio.com/jind-mimosa_cn_mmp__dev__dcr"
```

1. To pull images from private registry with secret enabled, configure below property in mmp/values

```
global:
  imagePullSecrets:
    - name: aws-registry #secret name
```

#### Redis Operator Helm chart installation

1. Install redis operator chart

```
cd mmp-orchestration/mmp-db/mmp-helm-charts/mmp
helm install redis-operator mmp/charts/redis-operator -f mmp/values.yaml
```

#### Redis Operator Helm chart Un-installation

1. Uninstall redis operator chart with below helm command

```
helm list -n mmp-redis
helm uninstall redis-operator -n mmp-redis
[helm uninstall <release-name> -n <namespace>]
```

#### Redis Cluster Configuration

Note: Before installing redis cluster make sure redis operator is in running state

1. To configure repository like aws ecr set image_repository in mmp/values as shown below

```
global:
  image_repository: "devopsartifact.jio.com/jind-mimosa_cn_mmp__dev__dcr"
```

1. To pull images from private registry with secret enabled, configure below property in mmp/values

```
global:
  imagePullSecrets:
    - name: aws-registry
```

1. To configure storageClassName and storage use below fields in mmp/charts//values.yaml file

```
    
...
    arbiter:
      enabled: false
      size: 1
      antiAffinityTopologyKey: "kubernetes.io/hostname"
    resources:
      limits:
        cpu: "300m"
        memory: "0.5G"
      requests:
        cpu: "300m"
        memory: "0.5G"
    volumeSpec:
      pvc:
        storageClassName: "rook-ceph-block"
        # accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 10Gi
```

## Redis Cluster Helm chart installation

1. Install redis cluster chart

```
helm install redis-cluster mmp/charts/redis-cluster -f mmp/values.yaml -n mmp-redis
```

## Redis Cluster Helm chart Un-installation

1. Uninstall Redis cluster chart

```
helm list -n mmp-redis
helm uninstall redis-cluster -n mmp-redis
```

# Backup & Restore

    ###### Redis Backup & Restore

***

Backups are done periodically. Demand backups can also be created. Please refer<br>

to redis operator backup doucumentation.

##### Backup Creation:

* Create backup secret yaml in templates folder
* Update values.yaml with bucketName, backup-location & cronJob

Backup configuration in values.yaml

```
backup:
  enabled: true
  image:
    repository: devopsartifact.jio.com/jind-mimosa_cn_mmp__dev__dcr/percona/percona-backup-mongodb
    tag: 1.8.1
  serviceAccountName: percona-server-mongodb-operator
  storages:
     s3-tg-hyd:
       type: s3
       s3:
         bucket: mmp-backup-325731bc-7784-4089-826d-a10dd5c80cf5
         credentialsSecret: s3-tg-hyd-secret
         region: tg-hyd-mmp3
         prefix: data/pbm/mongodb/hyd/mmp3
         endpointUrl: https://s3-openshift-storage.apps.mmp3.tg.hyd.dc.jio.indradhanus.com
         insecureSkipTLSVerify: true
  pitr:
    enabled: false
  tasks:
   - name: daily-twice-hyd
     enabled: true
     schedule: "0 */12 * * *"
     keep: 14
     storageName: s3-tg-hyd
     compressionType: gzip
```

`Note: Create the Secrets file with these base64-encoded keys using following command:`

```
$ echo -n 'plain-text-string' | base64 --wrap=0
```

### Backup secret

```

apiVersion: v1
kind: Secret
metadata:
  name: my-cluster-name-backup-s3
type: Opaque
data:
  AWS_ACCESS_KEY_ID: UkVQTEFDRS1XSVRILUFXUy1BQ0NFU1MtS0VZ
  AWS_SECRET_ACCESS_KEY: UkVQTEFDRS1XSVRILUFXUy1TRUNSRVQtS0VZ
```

Sample yamls to restore from backup within same & different cluster are present as restoreSame.yaml & restoreDiff.yaml.

##### Below are following steps to debug the backup & restore process.

```
Restore in same cluster
apiVersion: psmdb.percona.com/v1
kind: PerconaServerMongoDBRestore
metadata:
  name: restore-mongodb-4
spec:
  clusterName: mmp-mongodb
  storageName: noobabucket
  backupName: 2024-03-07T18:00:21Z
  insecureSkipTLSVerify: true
```

***

```
# Restore in different cluster
apiVersion: psmdb.percona.com/v1
kind: PerconaServerMongoDBRestore
metadata:
  name: restore-mongodb-diff-cluster-1
spec:
  clusterName: mmp-mongodb
  storageName: noobabucket
  backupSource:
    destination: s3://storage-mongo-backup-afabc529-6325-42ba-bef1-f4bbbab62ed3/2024-03-11T14:08:23Z
    s3:
      region: us-west-2
      bucket: storage-mongo-backup-afabc529-6325-42ba-bef1-f4bbbab62ed3
      prefix: data/pbm/backup
      endpointUrl: https://s3-openshift-storage.apps.mmp3.tg.hyd.dc.jio.indradhanus.com
      credentialsSecret: storage-backup-s3
      insecureSkipTLSVerify: true
```

##### Backup Debugging

Use aws-cli<br>

First configure aws with accesss key and secrets

```
aws configure
aws --endpoint https://s3-openshift-storage.apps.storage2.jecs.jio.com --no-verify-ssl s3api  list-objects --bucket bucket-name
```

Total size of bucket

```
aws --endpoint https://s3-openshift-storage.apps.storage2.jecs.jio.com --no-verify-ssl s3api list-objects  --bucket bucket-name  --output json --query "[sum(Contents[].Size), length(Contents[])]" | awk  'NR!=2 {print $0;next}  NR==2 {print $0/1024/1024/1024" GB"}'
```

[https://github.com/OT-CONTAINER-KIT/redis-operator/tree/master/scripts/backup](https://github.com/OT-CONTAINER-KIT/redis-operator/tree/master/scripts/backup)

# HPAs

Horizontal pod autoscaler (HPA) to specify how OpenShift Container Platform should automatically increase or decrease the scale of a replication controller or deployment configuration, based on metrics collected from the pods that belong to that replication controller or deployment configuration.

HPA's dir: `mmp-orchestration/HPA/redis`<br>

Install HPAs

```
cd HPA's_directory_for_redis
oc create -f <filename> -n mmp-redis
```

[https://docs.openshift.com/container-platform/4.8/nodes/pods/nodes-pods-autoscaling.html](https://docs.openshift.com/container-platform/4.8/nodes/pods/nodes-pods-autoscaling.html)

# Monitoring

To enable MongoDB database monitoring,

* Setup sidecar container for MongoDB exporter
* Setup service for MongoDB container
* Setup service monitors for MongoDB

Configuration for service & service monitors are present in `mmp-orchestration/monitoring/mongodb-monitoring-configs`

Monitors installation:

```
cd mongodb-monitoring-configs
oc create -f . -n values.yaml
```

MongoDB Exporter sidecar configuration

```
sidecars:
  - image: >-
      devopsartifact.jio.com/indradhanus__virtual__dev__dcr/databases/mongodb/mongodb_exporter:0.38
    env:
      - name: EXPORTER_USER
        valueFrom:
          secretKeyRef:
            name: mmp-mongodb-secrets
            key: MONGODB_CLUSTER_ADMIN_USER
      - name: EXPORTER_PASS
        valueFrom:
          secretKeyRef:
            name: mmp-mongodb-secrets
            key: MONGODB_CLUSTER_ADMIN_PASSWORD
      - name: POD_IP
        valueFrom:
          fieldRef:
            fieldPath: status.podIP
      - name: MONGODB_URI
        value: 'mongodb://$(EXPORTER_USER):$(EXPORTER_PASS)@127.0.0.1:27017'
    args:
      - '--discovering-mode'
      - '--compatible-mode'
      - '--collect-all'
      - '--log.level=debug'
      - '--mongodb.uri=$(MONGODB_URI)'
    name: metrics

```

[https://forums.percona.com/t/how-to-collect-metrics-and-ship-to-existing-prometheus-grafana-setup/21616/2](https://forums.percona.com/t/how-to-collect-metrics-and-ship-to-existing-prometheus-grafana-setup/21616/2)

# Troubleshooting

PerconaServerMongoDB Custom Resource with Percona Server for MongoDB options (it has handy psmdb shortname also). Steps to debug & troubleshoot are:

* Exec into the container
* Check the logs

The first thing you can check for the Custom Resource is to query it with oc get command:

```
$ oc get psmdb -n mmp-mongodb
Expected output
NAME              ENDPOINT                                           STATUS   AGE
my-cluster-name   my-cluster-name-mongos.default.svc.cluster.local   ready    5m26s
```

The Custom Resource should have Ready status.

##### Check the Pods

If Custom Resource is not getting Ready status, it makes sense to check individual Pods. You can do it as follows:

```
oc get pods -n mmp-mongodb
```

More documentation of Debugging can be found here:<br>

`https://docs.percona.com/percona-operator-for-mongodb/debug.html`
