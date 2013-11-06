test:
	@./node_modules/.bin/mocha --reporter List --timeout 20000

.PHONY: test