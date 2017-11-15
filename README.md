beamish direct runner
=====================

A Beamish runner that executes pipelines on a local system.

# OpenFaaS

Pipelines can be run on OpenFaaS.

First, [launch a Docker Swarm](https://github.com/openfaas/faas/blob/master/guide/deployment_swarm.md).

Then, instead of deploying the stack with the script, perform the steps below.

## Build The OpenFaaS Harness

To build the harness on its own:

```shell
docker-compose -f build.docker-compose.yml build build-beamish-harness-openfaas
```

Or to build everything:

```
npm run build
```

## Deploy The OpenFaaS Harness

Then to deploy it:

```shell
npm run deployOpenFaas
```

This will deploy all of the sample functions as well as the harness.

To check that it's working:

```
faas-cli list
```

The result will be something like:

```
Function                        Invocations     Replicas
func_wordcount                  1               1
func_echoit                     0               1
func_base64                     0               1
func_nodeinfo                   0               1
func_markdown                   0               1
func_hubstats                   0               1
func_decodebase64               0               1
func_webhookstash               0               1
func_beamish-harness            0               1
```

Check all is well by navigating to the UI:

http://localhost:8080/ui/

Try a few functions.
