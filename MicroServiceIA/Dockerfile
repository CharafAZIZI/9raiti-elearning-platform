FROM python:3.10

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#Copier le code sans le venv et les pycache
COPY app ./app
COPY dataset ./dataset

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]