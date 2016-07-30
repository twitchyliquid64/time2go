#!/bin/bash
#psql -h <host> -p <port> -U <username> -W <password> <database>
echo "Pass: hackingaway"
psql "user=hackadmin password=hackingaway host=govhacktfnsw.cshtalo4ughh.ap-southeast-2.rds.amazonaws.com port=5432 dbname=tfnsw"
