PHP=php
CONSOLE=bin/console
ifndef APP_ENV
include .env
endif

cache-clear:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) cache:clear --no-warmup || rm -rf var/cache/*
cache-warmup: cache-clear
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) cache:warmup
.PHONY: cache-clear cache-warmup

serve:
	@$(PHP) $(CONSOLE) server:start 0.0.0.0:8000 --docroot=public/ || exit 1
serve_stop:
	@$(PHP) $(CONSOLE) server:stop || exit 1
.PHONY: serve serve_stop

db-drop:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:database:drop --force
db-create:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:database:create
db-update:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:schema:update
db-update-dump-sql:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:schema:update --dump-sql
db-update-force:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:schema:update --force
db-create-schema:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:schema:create
db-migrate:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:migrations:migrate
db-status:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:migrations:status
db-diff:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:migrations:diff
db-fixtures:
	@test -f $(CONSOLE) && $(PHP) $(CONSOLE) doctrine:fixtures:load
.PHONY: db-drop db-create db-create-schema db-migrate db-diff db-status db-fixtures

test:
	@test -f vendor/bin/simple-phpunit && $(PHP) vendor/bin/simple-phpunit
test-coverage:
	@test -f vendor/bin/simple-phpunit && $(PHP) vendor/bin/simple-phpunit --coverage-html tmp/report
.PHONY: test test-coverage

assets:
	@test -f node_modules/.bin/encore && node_modules/.bin/encore production
assets-dev:
	@test -f node_modules/.bin/encore && node_modules/.bin/encore dev
assets-watch:
	@test -f node_modules/.bin/encore && node_modules/.bin/encore dev --watch
.PHONY: assets assets-dev assets-watch

deploy:
	@test -f vendor/bin/dep && $(PHP) vendor/bin/dep deploy prod
deploy-build:
	@test -f vendor/bin/dep && $(PHP) vendor/bin/dep build prod
deploy-release:
	@test -f vendor/bin/dep && $(PHP) vendor/bin/dep release prod
deploy-unlock:
	@test -f vendor/bin/dep && $(PHP) vendor/bin/dep deploy:unlock prod
deploy-dev:
	@test -f vendor/bin/dep && $(PHP) vendor/bin/dep deploy dev
deploy-dev-unlock:
	@test -f vendor/bin/dep && $(PHP) vendor/bin/dep deploy:unlock dev
.PHONY: deploy deploy-unlock deploy-dev deploy-dev-unlock