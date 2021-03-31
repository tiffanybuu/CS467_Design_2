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
df_pop = pd.read_csv("population.csv")

covid_rates_by_date = {}
for index, row in df.iterrows():
    date = row['date']
    state = row['state']
    cases = row['cases']

    pop_row = df_pop.loc[df_pop['State'] == state]
    pop_state = 0.0
    covid_rate = 0.0

    if not (pop_row.empty) and state != "Puerto Rico":
        pop_state = float(pop_row['Pop'])
        covid_rate = (cases / pop_state)
    else:
        continue

    if date not in covid_rates_by_date:
        covid_rates_by_date[date] = {}
        covid_rates_by_date[date]["states"] = []
        covid_rates_by_date[date]["states"].append({'state': state, 'cases': cases, 'covid_rate': covid_rate})
    else:
        covid_rates_by_date[date]["states"].append({'state': state, 'cases': cases, 'covid_rate': covid_rate})

final = []
for key, value in covid_rates_by_date.items():
    dicts = {}
    if 'date' not in dicts:
        dicts['date'] = key
    if 'states' not in dicts:
        dicts['states'] = value['states']
    final.append(dicts)
with open("public/covid_cases_states.json", "w") as outfile:
    json.dump(final, outfile)
