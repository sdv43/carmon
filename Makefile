start: 
	docker-compose start
stop:
	docker-compose stop
up:
	$(MAKE) ui_install
	$(MAKE) ui_build_dev
	docker-compose up -d --wait cmu
	docker-compose cp /path/to/jci cmu:/
	$(MAKE) ui_install_bundle
down:
	docker-compose down
ui_install:
	docker-compose run --rm --no-deps -w /app/ui node npm install
ui_build_dev:
	docker-compose run --rm --no-deps -w /app/ui node npm run build
ui_build:
	docker-compose run --rm --no-deps -w /app/ui -e NODE_ENV=production node npm run build -- --mode=production
ui_install_bundle:
	docker-compose exec -it cmu /app/scripts/install.sh
ui_uninstall_bundle:
	docker-compose exec -it cmu /app/scripts/uninstall.sh
ui_reinstall_bundle:
	$(MAKE) ui_uninstall_bundle
	$(MAKE) ui_build_dev
	$(MAKE) ui_install_bundle
cmu_sh:
	docker-compose exec -it cmu bash
api_build:
	docker-compose run \
        --rm \
        --no-deps \
        -w /app/api \
        -e GOOS=linux \
        -e GOARCH=arm \
        -e GOARM=7 \
        api \
        go build -o dist/carmon cmd/server/main.go
api_restart:
	docker-compose restart api
api_sh:
	docker-compose exec -it api sh
build:
	$(MAKE) api_build
	$(MAKE) ui_install
	$(MAKE) ui_build
	rm -rf carmon; \
	mkdir -p carmon/api carmon/ui; \
    cp -r api/dist carmon/api; \
    cp -r ui/dist carmon/ui; \
    cp -r scripts carmon
