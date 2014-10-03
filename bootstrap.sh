# postgres setup

#mkdir data/postgres

#postgres - l

# want to make these just idempotent ln but i cant :(

rm -f data/taplog 
rm -f data/fitbit
ln -s ~/Dropbox/taplog/ data/taplog
ln -s ~/Dropbox/data/fitbit/ data/fitbit
