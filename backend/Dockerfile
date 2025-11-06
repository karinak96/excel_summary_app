
FROM python:3.12-bullseye

WORKDIR /app

ENV DJANGO_SETTINGS_MODULE='excelapp.settings'

RUN pip install --upgrade pip && pip install pipenv

COPY Pipfile* /app/
RUN pipenv install --deploy --ignore-pipfile

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "pipenv run python manage.py migrate && pipenv run python manage.py collectstatic --noinput && pipenv run gunicorn excelapp.wsgi:application --bind 0.0.0.0:8000"]
