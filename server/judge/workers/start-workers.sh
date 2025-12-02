#!/bin/bash

mkdir -p /judge/work/c /judge/work/cpp /judge/work/java /judge/work/python
chmod -R 777 /judge/work

docker build -f Dockerfile.judge-gcc -t judge-gcc-worker .
docker build -f Dockerfile.judge-python -t judge-python-worker .
docker build -f Dockerfile.judge-java -t judge-java-worker .

docker rm -f judge-c-worker judge-cpp-worker judge-java-worker judge-python-worker 2>/dev/null

docker run -d --name judge-c-worker \
  -v /judge/work/c:/workspace \
  judge-gcc-worker

docker run -d --name judge-cpp-worker \
  -v /judge/work/cpp:/workspace \
  judge-gcc-worker

docker run -d --name judge-java-worker \
  -v /judge/work/java:/workspace \
  judge-java-worker

docker run -d --name judge-python-worker \
  -v /judge/work/python:/workspace \
  judge-python-worker

echo "Workers started successfully!"
