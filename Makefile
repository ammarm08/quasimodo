test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		./tests/*.js

.PHONY: test
