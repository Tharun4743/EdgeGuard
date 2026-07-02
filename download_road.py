import urllib.request
import zipfile
import os

url = 'https://zenodo.org/records/10462796/files/road.zip'
zip_path = 'data/road.zip'
extract_path = 'data/road_dataset'

print(f"Downloading {url}...")
urllib.request.urlretrieve(url, zip_path)

print(f"Extracting {zip_path}...")
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_path)

print("Removing zip file...")
os.remove(zip_path)
print("Done!")
