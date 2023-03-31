Signalwire Relay
================

Module for showcasing the interaction with the Signalwire Relay API. It makes use of the SDK and uses Axios for making an HTTP request.

The Dockerfile uses a health check to see if the process is serving the respective logic. The health check is a Node script since neither curl nor wget are part of the slim base image.

This repository is supplemented by the same use case being implemented using the [REST API](https://github.com/s-schumann/signalwire-rest).

# Using Docker 

To build the Docker image use the following commands (adapt with your respective tags):

```shell
docker build --target dev --target production --tag signalwire-relay .
docker build --target production -t schumann/signalwire-relay .
```

We can push or run/stop the container with the commands below.

```shell
docker push schumann/signalwire-relay:latest
docker run --env-file .env signalwire-relay
docker ps
docker stop <container_id>
```

Pushing this build is fine for testing but won't run in most external environments.

To build on MacOS we should consider that a published image needs a different platform. We can use `buildx` for that:

```shell
docker buildx create --use
docker buildx build --platform linux/amd64 --target production --push -t schumann/signalwire-relay .
```

The `buildx create` command has to be used only once. Then we can build for (the typically used) 64-bit Linux, for example.

# Samples

Besides the main Relay use case comparing the Relay API with the REST API, this repository contains variou samples showcasing Relay interactions on the Signalwire platform.

The `/samples` directory contains the following use cases:

|File|Use Case|
|-|-|
|[`2peer.js`](./samples/2peer.js)|Connect two peers. Receive an inbound call and make an outbound call to a second number.|
|[`2peerMsg.js`](./samples/2peerMsg.js)|Receive an inbound call and send a message via Relay API.|
|[`early-media.js`](./samples/early-media.js)|Play early media and also in-call media. Showcase early media works and promises fire when expected.|

Copyright (c) Sebastian Schumann, 2023
