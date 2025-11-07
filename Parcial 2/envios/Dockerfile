FROM python:3.12-slim AS runtime
WORKDIR /app

COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

COPY app.py ./
COPY vehiculos_pb2.py ./
COPY vehiculos_pb2_grpc.py ./

EXPOSE 3003
CMD ["python","app.py"]
