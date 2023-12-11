up_only_aws:
	docker-compose --profile awslocal up -d

build:
	docker-compose --profile all build

logs:
	docker logs -f admin-service-mysql

log_mysql:
	docker logs -f admin-service-mysql


start:
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose down
	docker-compose up -d

nuke:
	docker-compose --profile all down --volumes
	docker-compose --profile all up --build -d

get_env_file:
	aws --region us-east-2 secretsmanager get-secret-value --secret-id /build/admin-service/env-local --query SecretString --output text > .env
