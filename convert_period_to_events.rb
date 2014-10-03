#!/usr/bin/env ruby
require 'csv'
require 'date'
require 'json'
CSV($stdin, headers:true, header_converters:[:symbol]) do |csv_in|  
  result = csv_in.flat_map do |row|
    date, start_time, end_time = row.values_at(:date, :time, :endtime)

    end_timestamp = DateTime.parse "#{date}T#{end_time}+1000"
    start_timestamp = DateTime.parse "#{date}T#{start_time}+1000"
    
    start_timestamp = start_timestamp.prev_day if start_timestamp.hour > 12
    
    [
     {:timestamp => start_timestamp.iso8601(3), :value=> "Sleep Start", :source => "com.fitbit", :eventType=>"manuallyExtracted"},
     {:timestamp => end_timestamp.iso8601(3), :value=> "Sleep End", :source => "com.fitbit", :eventType => "manuallyExtracted"}
     ]
  end
  
  result.each do |row|
    puts row.to_json
  end
end


