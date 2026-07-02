import pandas as pd
import json
import numpy as np
import features

DATA_FILE = 'processed_data.csv'
CONFIG_FILE = 'model_config.json'

def generate_parity_data():
    df = pd.read_csv(DATA_FILE)
    
    # Take 100 contiguous rows to build up state
    df_sample = df.iloc[5000:5100].copy().reset_index(drop=True)
    
    # Extract features on this isolated subset
    features_df = features.extract_features(df_sample)
    
    with open(CONFIG_FILE, 'r') as f:
        config = json.load(f)
    top_ids = config['top_5_can_ids']
    
    features_df, _ = features.apply_top_ids(features_df, top_ids)
    
    test_cases = []
    
    # We will just export all 100 rows, Java will process them in order,
    # and we will compare the last 20 rows
    for idx in range(len(df_sample)):
        raw_row = df_sample.iloc[idx]
        feat_row = features_df.iloc[idx]
        
        data_bytes = [str(raw_row[f'DATA{i}']) for i in range(8)]
        
        test_case = {
            'index': int(idx),
            'raw': {
                'Timestamp': float(raw_row['Timestamp']),
                'CAN_ID': str(raw_row['CAN_ID']),
                'DLC': int(raw_row['DLC']),
                'DATA': data_bytes,
                'Flag': str(raw_row['Flag'])
            },
            'features': feat_row.values.tolist()
        }
        test_cases.append(test_case)
        
    with open('parity_test_data.json', 'w') as f:
        json.dump(test_cases, f, indent=4)
        
    print("Exported 100 sequential test cases to parity_test_data.json")

if __name__ == '__main__':
    generate_parity_data()
