FROM node:latest

# Install Ruby
RUN \
  apt-get update && \
  apt-get install -y ruby ruby-dev && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /home/app
ADD . /home/app

RUN npm update -g npm
RUN \
    make install && \
    npm rebuild node-sass && \
    npm install gulp-imagemin && \
    make build

EXPOSE 8080

CMD make run
