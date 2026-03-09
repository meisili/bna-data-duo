
import pandas as pd
import requests
import time
import re

# Setup
API_KEY = "yMgwnlBsql8axIBF9rnaf697f5tLlc9S2KYyO2P9"
BASE_URL = "https://commonchemistry.cas.org/api"
data_path = "data/CDPH Search results - 1_12_2026, 3_34_15 PM.csv"
data = pd.read_csv(data_path, low_memory = False)

# Function to extract CAS numbers that are already in the ingredient name
def get_cas_from_text(text):
    if not text.strip():
        return ""
    cas_numbers = re.findall(r'\b\d{2,7}-\d{2}-\d\b', str(text))
    return cas_numbers if cas_numbers else ""

# Function to clean ingredient name (remove CAS numbers)
def clean_name(text):
    if pd.isna(text):
        return ""
    text = str(text)
    text = re.sub(r'\d{2,7}-\d{2}-\d', '', text)  # Remove CAS
    text = re.sub(r'/\s*\d+[-\d/\s]*', '', text)   # Remove extra numbers
    return text.strip()


def get_official_name(unique_cas):
    if not unique_cas or unique_cas == "":
        return ""
    
    url = f"{BASE_URL}/detail"
    headers = {"X-Api-Key": API_KEY}
    params = {"cas_rn": unique_cas}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json().get('name', 'NOT FOUND')
        else:
            return "NOT FOUND"
    except:
        return "ERROR"
    

unique_cas = data["Ingredient Name"].unique()

cas_metadata = {}
for ingredient in unique_cas:
    cas_metadata[ingredient] = {
        'cas_number': get_cas_from_text(ingredient),
        'clean_name': get_official_name(ingredient)
    }