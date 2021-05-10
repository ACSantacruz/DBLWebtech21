import sqlite3
import pandas as pd

df = pd.read_csv("https://raw.githubusercontent.com/CocoCosmos/DBLWebtech21/development/enron-v1.csv", index_col=[1,4])
grouped = df.groupby(['fromId','toId']).mean(['sentiment'])

grouped.to_csv(r'C:\Users\20190907\Documents\GitHub\DBLWebtech21\enron-clean.csv')
