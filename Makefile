.PHONY: help dev up down install test lint typecheck smoke

.DEFAULT_GOAL := help

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-12s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server (foreground)
	npm run dev

up: ## Start local stack (background)
	@if [ -f .next-dev.pid ] && kill -0 $$(cat .next-dev.pid) 2>/dev/null; then \
		echo "already running (pid $$(cat .next-dev.pid))"; \
	else \
		nohup npx next dev > .next-dev.log 2>&1 & echo $$! > .next-dev.pid; \
		echo "started (pid $$(cat .next-dev.pid)), logs in .next-dev.log"; \
	fi

down: ## Stop local stack
	@if [ -f .next-dev.pid ]; then \
		kill $$(cat .next-dev.pid) 2>/dev/null || true; \
		rm -f .next-dev.pid; \
		echo "stopped"; \
	else \
		echo "not running"; \
	fi

test: ## Run unit/integration tests
	npm run test

lint: ## Lint touched files
	npm run lint

typecheck: ## Typecheck the project
	npm run typecheck

smoke: ## Verify third-party API/MCP connectivity
	npm run smoke
