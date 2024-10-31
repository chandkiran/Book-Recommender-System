import pickle
import json
import pandas as pd
import numpy as np

def replace_nan_with_none(item):
    """Recursively replace NaN values with None in a list or array."""
    if isinstance(item, float) and np.isnan(item):
        return None
    elif isinstance(item, list):
        return [replace_nan_with_none(sub_item) for sub_item in item]
    elif isinstance(item, np.ndarray):
        return [replace_nan_with_none(sub_item) for sub_item in item.tolist()]
    return item

# Function to convert a pickle file to JSON
def convert_pkl_to_json(pkl_file_path, json_file_path):
    # Load the pickle file
    with open(pkl_file_path, 'rb') as pkl_file:
        data = pickle.load(pkl_file)

    # Check if the loaded object is a DataFrame
    if isinstance(data, pd.DataFrame):
        # Reset index to turn the index into a column
        data.reset_index(inplace=True)
        # Rename the index column for clarity
        data.rename(columns={'index': 'Book-Title'}, inplace=True)
        # Convert to JSON format
        data_json = data.to_dict(orient='records')
    elif isinstance(data, np.ndarray):
        data_json = replace_nan_with_none(data.tolist())
    elif isinstance(data, list):
        data_json = [replace_nan_with_none(item) for item in data]
    
    # Save as JSON
    with open(json_file_path, 'w') as json_file:
        json.dump(data_json, json_file, indent=4)

# Convert each .pkl file to .json
convert_pkl_to_json('popular.pkl', 'popular.json')
convert_pkl_to_json('books.pkl', 'books.json')
convert_pkl_to_json('similarity_scores.pkl', 'similarity_scores.json')
convert_pkl_to_json('pt.pkl', 'pt.json')
