import json
import os
import sys
import glob
import io
from datetime import datetime, date
from dateutil.parser import parse
from collections import defaultdict, OrderedDict
import pandas as pd
from sklearn import preprocessing



# parse through covid cases to make front-end retrieving easier 
df = pd.read_csv("us-states.csv")



covid_rates_by_date = {}
for index, row in df.iterrows():
    date = row['date']
    state = row['state']
    cases = row['cases']

    if date not in covid_rates_by_date:
        covid_rates_by_date[date] = {}
        # covid_rates_by_date.append({'date': date, 'states': [{'state': state, 'cases': cases}]})
        # covid_rates_by_date["covid_date"] = {}
        # covid_rates_by_date[date]["date"] = date
        covid_rates_by_date[date]["states"] = []
        covid_rates_by_date[date]["states"].append({'state': state, 'cases': cases})
        # covid_rates_by_date.append({"date": date, "states": [{'state': state, 'cases': cases}]})
    else:
        covid_rates_by_date[date]["states"].append({'state': state, 'cases': cases})

final = []
for key, value in covid_rates_by_date.items():
    dicts = {}
    if 'date' not in dicts:
        dicts['date'] = key
    if 'states' not in dicts:
        # print(value['states'])
        dicts['states'] = value['states']
    final.append(dicts)
with open("public/covid_cases_states.json", "w") as outfile:
    json.dump(final, outfile)
