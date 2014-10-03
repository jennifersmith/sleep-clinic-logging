set -e
csvstack data/taplog/*.csv | csvjson | jq '.[] | {timestamp, value:.cat1, source: "mymobile/taplog", eventType: "taplogged"}' -c | sort -u > data/taplog.jsonl
csvgrep data/fitbit/sleeptimes_really_final.csv -ctime -r "^0$" -i | ./convert_period_to_events.rb > data/fitbit_sleep.jsonl

