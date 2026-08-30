#!/bin/sh
set -e

uv run ./prestart.sh

exec uv run uvicorn app.main:app \
	--host 0.0.0.0 \
	--port 8000 \
	--proxy-headers \
	--forwarded-allow-ips="*"