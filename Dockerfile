FROM node:25-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DATA_DIR=/data PORT=8080
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home app && mkdir /data && chown app:app /data
COPY backend/ ./backend/
RUN chmod -R a+rX /app/backend
COPY frontend/package.json ./frontend/package.json
COPY --from=frontend /build/frontend/dist ./frontend/dist/
# liara.jso[n]: optional match, because the Liara CLI leaves liara.json out of uploads.
COPY Dockerfile liara.jso[n] ./
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD python -c "import os,urllib.request;urllib.request.urlopen('http://127.0.0.1:'+os.getenv('PORT','8080')+'/api/ready',timeout=3)"
# Platform disks mount root-owned: fix ownership, then drop to the unprivileged user.
CMD ["sh", "-c", "chown -R app:app /data 2>/dev/null; exec setpriv --reuid=10001 --regid=10001 --init-groups python backend/start.py"]
