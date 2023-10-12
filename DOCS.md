### Production

```bash
# firewall
$ sudo ufw allow 8080/tcp
$ sudo ufw reload

# start
$ PORT=8080 pm2 start index.js -i 1 --update-env --name="load-balancer"

# stop
$ pm2 stop index.js --name="load-balancer"

# logs
$ pm2 logs load-balancer

# delete
$ pm2 delete load-balancer

# list
$ pm2 status

# Generate Startup Script
$ pm2 startup

# Freeze your process list across server restart
$ pm2 save

# Remove Startup Script
$ pm2 unstartup

# after code change
$ pm2 reload all
```