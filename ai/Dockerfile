FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# 이 Dockerfile은 저장소 루트를 build context로 사용한다.
COPY ai/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ai/app ./app
COPY datas/data/malware_db.csv ./data/malware_db.csv
COPY datas/data/malware_embedding_data.csv ./data/malware_embedding_data.csv

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
