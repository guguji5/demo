FROM ubuntu:14.04
MAINTAINER damon 
ENV REFRESHED_AT 2019-10-12
RUN apt-get -yqq update && apt-get -yqq install nginx
RUN mkdir -p /var/www/html/website
ADD index.html /var/www/html/website
RUN chmod -R 777 /var/www/html/website
ADD nginx/global.conf /etc/nginx/conf.d/
ADD nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80