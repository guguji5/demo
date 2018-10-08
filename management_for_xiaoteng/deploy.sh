npm run build

rsync -avz --delete ./dist/* root@39.106.198.9:/opt/tomcat8/apache-tomcat-8.5.29/webapps/management