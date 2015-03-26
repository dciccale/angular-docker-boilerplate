# vim: ts=4 sw=4 noexpandtab
SHELL  := /bin/bash

install:
	@echo + Installing
	-@gem install sass --no-ri --no-rdoc
	-@npm install -g bower gulp
	-@npm install
	-@bower install --config.interactive=false --allow-root

build:
	@echo + Building
	-@gulp dist
