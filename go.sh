set -e
latest_taplog=$(ls -tr data/taplog/ | tail -n1)

cat "data/taplog/$latest_taplog" | csvjson | jq '.[] | {timestamp, value:.cat1 | rtrimstr(" "), source: "mymobile/taplog", eventType: "taplogged"}' -c | sort -u > data/taplog.jsonl
csvgrep data/fitbit/sleeptimes_really_final.csv -ctime -r "^0$" -i | ./convert_period_to_events.rb > data/fitbit_sleep.jsonl

# I was using json stuff but was too hard.... or not what I needed.

psql sleepdiary -c "DROP TABLE IF EXISTS events"
psql sleepdiary -c "DROP TABLE IF EXISTS statechanges"
psql sleepdiary -c "DROP TABLE IF EXISTS sleepwake"
psql sleepdiary -c "CREATE TABLE events(id SERIAL, occurredAt TIMESTAMP,eventType TEXT, source TEXT, value TEXT)"

cat data/*.jsonl  | jq '[.timestamp, .eventType, .source, .value] | @csv' -r | psql sleepdiary -c "COPY events(occurredAt,eventType,source,value) FROM STDIN WITH CSV"

psql sleepdiary -c "create table statechanges as  select occurredAt, 'asleep' as newstate from events where value in ('Nap Start', 'Sleep Start') union select occurredAt, 'awake' as newstate from events where value in ('Nap End', 'Sleep End');"


bad_rows=$(psql sleepdiary -c "select row_to_json(compared) from (select occurredat, newstate,  lag(occurredat, 1) OVER (ORDER BY occurredat) AS oldstatetime, lag(newstate, 1) OVER (ORDER BY occurredat) AS oldstate from statechanges order by occurredat) as compared where compared.oldstate = compared.newstate;" -t)

if [ -n "$bad_rows" ]
then
    echo "OH NO ... there are some dodgy looking events. "
    echo $bad_rows | jq .
    exit -1
fi


psql sleepdiary -c "create table sleepwake as (select occurredat as from, lead(occurredat, 1) OVER (ORDER BY occurredat) AS to, newstate as state from statechanges order by occurredat);"
