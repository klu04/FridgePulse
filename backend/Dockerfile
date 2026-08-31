FROM python:3.14
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.11.23 /uv /uvx /bin/

# Compile bytecode & Cache settings
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_PROJECT_ENVIRONMENT=/opt/venv

# 1. Set the working directory ONCE to where your backend code actually lives
WORKDIR /app/backend/

# 2. Update PATH to point to the .venv inside this specific directory
ENV PATH="/opt/venv/bin:$PATH"

# 3. Install dependencies (The bind mounts will now correctly map to /app/backend/)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

# 4. Copy files directly into the current WORKDIR (.)
COPY ./uv.lock ./pyproject.toml ./alembic.ini ./
COPY ./entrypoint.sh ./prestart.sh ./
COPY ./app ./app

RUN chmod +x ./entrypoint.sh ./prestart.sh

# 5. Final sync
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen

# 6. Entrypoint works automatically because we are already in /app/backend/
ENTRYPOINT ["sh", "entrypoint.sh"]