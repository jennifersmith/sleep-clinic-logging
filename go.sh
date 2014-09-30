cat data/taplog/*.csv | head -1  > data/taplog.csv
cat data/taplog/*.csv | grep '^"' | sort -u >> data/taplog.csv
