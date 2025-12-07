#!/usr/bin/env bash
set -e

echo "[*] Creating host work directories..."
mkdir -p /judge/work/gcc
mkdir -p /judge/work/cpp
mkdir -p /judge/work/java
mkdir -p /judge/work/python

echo "[*] Removing old containers..."
docker rm -f judge-gcc-worker judge-cpp-worker judge-java-worker judge-python-worker 2>/dev/null || true

echo "[*] Building images..."
docker build -f Dockerfile.judge-gcc     -t judge-gcc-image     .
docker build -f Dockerfile.judge-cpp     -t judge-cpp-image     .
docker build -f Dockerfile.judge-java    -t judge-java-image    .
docker build -f Dockerfile.judge-python  -t judge-python-image  .

echo "[*] Starting workers with volume mounts..."

docker run -d --name judge-gcc-worker \
  -v /judge/work/gcc:/workspace \
  judge-gcc-image \
  sleep infinity

docker run -d --name judge-cpp-worker \
  -v /judge/work/cpp:/workspace \
  judge-cpp-image \
  sleep infinity

docker run -d --name judge-java-worker \
  -v /judge/work/java:/workspace \
  judge-java-image \
  sleep infinity

docker run -d --name judge-python-worker \
  -v /judge/work/python:/workspace \
  judge-python-image \
  sleep infinity

echo "[*] Started workers:"
docker ps | grep judge || echo "No judge workers running!"
