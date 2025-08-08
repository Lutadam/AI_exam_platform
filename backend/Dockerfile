ARG PYTHON_VERSION="3.13.6"
FROM python:${PYTHON_VERSION}

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY . /app

EXPOSE 8000
CMD ["fastapi", "run", "/app/main.py"]
