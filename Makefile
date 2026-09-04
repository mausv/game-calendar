.PHONY: install dev build start lint typecheck test up down logs check

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

check: lint typecheck test
