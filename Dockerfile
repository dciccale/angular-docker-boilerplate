FROM dockerfile/nodejs

# Install Ruby
RUN \
  apt-get update && \
  apt-get install -y ruby ruby-dev ruby-bundler && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /home/app
ADD . /home/app

RUN \
  gem install sass --no-ri --no-rdoc && \
  npm install -g gulp bower && \
  npm install && \
  npm rebuild node-sass && \
  bower install --config.interactive=false --allow-root && \
  gulp dist

EXPOSE 3001

CMD ["gulp", "serve-dist"]
