csvstack data/taplog/*.csv | csvjson | jq ".[] | {timestamp, category:.cat1}" -c | sort -u > data/taplog.jsonl
