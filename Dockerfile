FROM dockerfile/nodejs

# Install Ruby
RUN \
  apt-get update && \
  apt-get install -y ruby ruby-dev ruby-bundler && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /home/app
ADD . /home/app

RUN make install && make build

EXPOSE 3001

CMD ["gulp", "serve-dist"]
