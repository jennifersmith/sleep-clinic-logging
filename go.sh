set -e
csvstack data/taplog/*.csv | csvjson | jq '.[] | {timestamp, value:.cat1 | rtrimstr(" "), source: "mymobile/taplog", eventType: "taplogged"}' -c | sort -u > data/taplog.jsonl
csvgrep data/fitbit/sleeptimes_really_final.csv -ctime -r "^0$" -i | ./convert_period_to_events.rb > data/fitbit_sleep.jsonl

# I was using json stuff but was too hard.... or not what I needed.

psql sleepdiary -c "DROP TABLE IF EXISTS events"
psql sleepdiary -c "CREATE TABLE events(id SERIAL, occurredAt TIMESTAMP,eventType TEXT, source TEXT, value TEXT)"

cat data/*.jsonl  | jq '[.timestamp, .eventType, .source, .value] | @csv' -r | psql sleepdiary -c "COPY events(occurredAt,eventType,source,value) FROM STDIN WITH CSV"
