set -e

# postgres setup

(pg_ctl -D conf/ -l logs/postgres-server.log stop)
rm -rf data/postgres
initdb data/postgres >> logs/bootstrap.log
#Note to self : -w waits supposedly for server to start. this appears to work so far. Hard won tho :)
pg_ctl -w -D conf/ -l logs/postgres-server.log start

psql postgres -c "create database sleepdiary"
psql sleepdiary -c "CREATE TABLE events ( id SERIAL, data JSON );"
# want to make these just idempotent ln but i cant :(
rm -f data/taplog 
rm -f data/fitbit
ln -s ~/Dropbox/taplog/ data/taplog
ln -s ~/Dropbox/data/fitbit/ data/fitbit
