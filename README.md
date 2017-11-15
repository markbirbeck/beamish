beamish direct runner
=====================

A Beamish runner that executes pipelines on a local system.

# OpenFaaS

Pipelines can be run on OpenFaaS.

First, [launch a Docker Swarm](https://github.com/openfaas/faas/blob/master/guide/deployment_swarm.md).

Then, instead of deploying the stack with the script, run the following:

```shell
npm run deployOpenFaas
```

Check all is well by navigating to the UI:

http://localhost:8080/ui/

Try a few functions.
