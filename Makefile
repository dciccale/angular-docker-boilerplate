# vim: ts=4 sw=4 noexpandtab
SHELL  := /bin/bash

install:
	@echo + Installing
	-@npm install
	-@npm install -g bower gulp
	-@bower install --allow-root
	-@gem install sass
