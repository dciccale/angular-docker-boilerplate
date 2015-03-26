# Angular Docker Boilerplate [![Circle CI](https://circleci.com/gh/dciccale/angular-docker-boilerplate.svg?style=svg)](https://circleci.com/gh/dciccale/angular-docker-boilerplate)



## Installation

```bash
$ [sudo] make install
```

## Development

```bash
$ npm start
```

## Tests

```bash
$ npm test
```

## Production

```bash
$ make build
```

Generates a `dist` diretory with all the files ready to serve.

## Docker

```bash
$ docker-compose up
```

See [docker-compose.yml](docker-compose.yml) and [Dockerfile](Dockerfile)

Will install al dependencies, build the app for production and serve it through port 3001 mapped to
port 80.

Image at DockerHub [dciccale/angular-docker-boilerplate](https://registry.hub.docker.com/u/dciccale/angular-docker-boilerplate/)

## Continuous Integration

With [CircleCI](https://circleci.com/), see [circle.yml](docker-compose.yml)

## Continuous Delivery

With [Tutum](https://www.tutum.co/), see [tutum.yml](docker-compose.yml)
