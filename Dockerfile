FROM node:latest

# Install Ruby
RUN \
  apt-get update && \
  apt-get install -y ruby ruby-dev && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /home/app
ADD . /home/app

RUN \
    make install && \
    npm rebuild node-sass && \
    make build && \
    npm prune --production

EXPOSE 8080

CMD make run
