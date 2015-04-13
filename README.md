# Angular Docker Boilerplate [![Circle CI](https://circleci.com/gh/dciccale/angular-docker-boilerplate.svg?style=svg)](https://circleci.com/gh/dciccale/angular-docker-boilerplate)

See deployed demo at [web-1.angular-docker-boilerplate.dciccale.cont.tutum.io](http://web-1.angular-docker-boilerplate.dciccale.cont.tutum.io)

## Installation

```bash
$ git clone --recursive git://github.com/dciccale/angular-docker-boilerplate.git
$ git submodule foreach npm install
$ [sudo] make install
```

## Development

```bash
$ npm start
```

## Tests

Run client and server tests

```bash
$ npm test
```

If you want to run the tests sepparately use:

```bash
$ gulp test-client
$ gulp test-server
```

## Coverage

Code coverage report is generated:

for client code in `coverage/client/`

for server code in `coverage/server/`

## Production

```bash
$ make build
```

Generates a `dist` diretory with all the files ready to serve.

Run in production mode.

```bash
$ make run
```

## API

The api is on it's own repository https://github.com/dciccale/node-api-mongo-docker and is linked to
this container.

## Docker

Install [Docker](https://docs.docker.com/installation/#installation) and [Compose](https://docs.docker.com/compose/install/#install-compose)

Start docker and run:

```bash
$ docker-compose up
```

See [docker-compose.yml](docker-compose.yml) and [Dockerfile](Dockerfile)

Will install all dependencies, build the app for production and start the server.

Image at DockerHub [dciccale/angular-docker-boilerplate](https://registry.hub.docker.com/u/dciccale/angular-docker-boilerplate/)

## Continuous Integration

With [CircleCI](https://circleci.com/), see [circle.yml](circle.yml)

Build url: https://circleci.com/gh/dciccale/angular-docker-boilerplate

## Continuous Delivery

With [Tutum](https://www.tutum.co/), see [tutum.yml](tutum.yml)

See deployed node at http://web-1.angular-docker-boilerplate.dciccale.cont.tutum.io

## Next

- For now it only provides a production ready docker image, I want to provide a development enviroment also.
