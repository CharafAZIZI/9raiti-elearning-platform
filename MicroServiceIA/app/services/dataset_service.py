import pandas as pd

class DatasetService:

    def fetch_dataset(self):

        return pd.read_csv("dataset/elearning_dataset.csv")