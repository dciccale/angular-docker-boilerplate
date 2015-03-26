# vim: ts=4 sw=4 noexpandtab
SHELL  := /bin/bash
JS_SRC := $(shell find src/app -type f -name '*.js')

lint-tap:
	@echo + Generating TAP report
	-@node ./node_modules/eslint/bin/eslint.js --format ./node_modules/eslint-tap/tap.js $(JS_SRC)

install:
	@echo + Installing
	-@npm install
	-@npm install -g bower
	-@npm install -g gulp
	-@bower install --allow-root
	-@gem install sass

.PHONY: lint-tap
