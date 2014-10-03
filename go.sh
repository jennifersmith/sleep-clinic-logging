csvstack data/taplog/*.csv | csvjson | jq '.[] | {timestamp, category:.cat1,source: "taplog" }' -c | sort -u > data/taplog.jsonl
csvgrep data/fitbit/sleeptimes_really_final.csv -ctime -r "^0$" -i | ./convert_period_to_events.rb > data/fitbit_sleep.jsonl
