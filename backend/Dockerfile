FROM python:3.10-slim-buster

WORKDIR /app

ENV VIRTUAL_ENV=/venv
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
