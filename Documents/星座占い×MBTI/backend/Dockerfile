FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# SQLite データベースの永続化先ディレクトリ
RUN mkdir -p /data

EXPOSE 8000

CMD ["sh", "-c", "mkdir -p /data && chmod 777 /data && uvicorn main:app --host 0.0.0.0 --port 8000"]
