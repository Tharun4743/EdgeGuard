import onnxruntime as rt
import numpy as np
import joblib
import pandas as pd
import os
import features

MODEL_DIR = '.'
DATA_FILE = 'processed_data.csv'

def verify_models():
    print("Loading data for verification...")
    # Read raw data
    full_df = pd.read_csv(DATA_FILE)
    
    # We just need 1000 rows
    full_df = full_df.head(1000).copy()
    
    # Extract features
    full_df = features.extract_features(full_df)
    
    import json
    with open(os.path.join(MODEL_DIR, 'model_config.json'), 'r') as f:
        config = json.load(f)
    top_ids = config['top_5_can_ids']
    
    X, y = features.apply_top_ids(full_df, top_ids)
    
    X_batch = X.values.astype(np.float32)
    
    # Sklearn predictions
    print("Running sklearn predictions...")
    pkl_model = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
    pkl_preds = pkl_model.predict(X_batch)
    
    # ONNX predictions
    print("Running ONNX predictions...")
    sess = rt.InferenceSession(os.path.join(MODEL_DIR, 'model.onnx'), providers=['CPUExecutionProvider'])
    input_name = sess.get_inputs()[0].name
    label_name = sess.get_outputs()[0].name
    
    onnx_preds = sess.run([label_name], {input_name: X_batch})[0]
    
    # Compare
    matches = (pkl_preds == onnx_preds)
    accuracy = np.sum(matches) / len(matches)
    
    print(f"Match accuracy between ONNX and Sklearn on {len(matches)} rows: {accuracy * 100:.2f}%")
    if accuracy == 1.0:
        print("SUCCESS: ONNX model predictions perfectly match Sklearn model.")
    else:
        print("WARNING: Mismatch detected between models.")
        
    # Also test shape matches expected Java 13 features
    if X_batch.shape[1] != 13:
        print(f"WARNING: Expected 13 features for Java parity, got {X_batch.shape[1]}")
    else:
        print("SUCCESS: 13 features confirmed for Java parity.")

if __name__ == '__main__':
    verify_models()
