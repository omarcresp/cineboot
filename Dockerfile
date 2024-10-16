FROM ubuntu:latest

COPY cineboot /usr/local/bin/cineboot

EXPOSE 8000

CMD ["cineboot"]

