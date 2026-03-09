import csv
import requests
import time

# Your API key
API_KEY = "AHFKINXhLc4MAajui0VAQ8wtBbf5iHHq79weice5"

# Read the CSV and store results
results = []

with open('data/ingredients_cleaned.csv', 'r') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        ingredient = row['original_ingredient']
        cas_number = eval(row['cas_number']) # eg eval(row['cas_number'])
        clean_name = row['clean_name']


        # Start with empty values
        api_rn = ''
        api_name = ''
        
        # TODO: Here's one strategy to try:
        # (For the CSV that you're pulling data from...)
        # - If a cas_number value is a "list" (ie actually a string that looks like a list)
        # - Then you can do one of several things:
        #  - 1) use "eval" function to convert to a true Python list, e.g. eval(cas_number)
        #. - 2) or do some string clean-up e.g. cas_number.replace("[",'").replace("]", "") followed by
        #.      .split(",") which should yield a proper list of CAS numbers
        # NOTE: The goal is to get a true Python list of CAS NUMBERS so that you can...
        # ...THEN prepare the data for an API call with multiple CAS NUMBERS 
        #if cas_number == "['80-54-6']":
            #cas_number = '80-54-6'
            #breakpoint()
        #else:
            #continue
        
        # Try to look up by CAS number first
        if cas_number:
            url = f"https://commonchemistry.cas.org/api/detail"
            headers = {"X-Api-Key": API_KEY}
            response = requests.get(url, headers=headers, params={'cas_rn': cas_number})
            
            if response.status_code <= 400:
                data = response.json()
                api_rn = data.get('rn', '')
                api_name = data.get('name', '')
        
        # If we didn't find it, try by clean name
        if not api_name and clean_name:
            url = f"https://commonchemistry.cas.org/api/search?q={clean_name}"
            headers = {"X-Api-Key": API_KEY}
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('count', 0) > 0:
                    api_rn = data['results'][0].get('rn', '')
                    api_name = data['results'][0].get('name', '')
        
        # Save the result
        results.append([ingredient, cas_number, clean_name, api_rn, api_name])
        
        print(f"Done: {ingredient}")
        time.sleep(0.1)

# Write to new CSV
with open('data/ingredients_with_api_data.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['original_ingredient', 'cas_number', 'clean_name', 'api_rn', 'api_name'])
    writer.writerows(results)

print("All done!")