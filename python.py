from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Your API key
api_key = 'a79fb7c7169443e3b2fea3699ac48fa9'

# Function to fetch general news headlines
def fetch_general_news():
    url = 'https://newsapi.org/v2/top-headlines'
    params = {
        'country': 'us',  # You can change this to any country code
        'category': 'general',  # Categories like business, technology, etc.
        'pageSize': 5,  # Number of articles to retrieve
        'apiKey': api_key
    }
    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        return {'error': f"Failed to fetch news: {response.status_code}"}

# Function to fetch real-time disaster-related news
def fetch_real_time_data():
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": "disaster",  # Query for disaster-related news
        "apiKey": api_key
    }
    response = requests.get(url, params=params)
    return response.json()

# Route to display general news headlines in the console
@app.route('/general-news')
def get_general_news():
    data = fetch_general_news()
    articles = data.get('articles', [])

    # Print headlines and descriptions in the console
    for article in articles:
        print(f"Title: {article['title']}")
        print(f"Description: {article['description']}\n")
    
    return jsonify(data)

# API endpoint to fetch real-time disaster-related data
@app.route('/api/real-time-data')
def get_real_time_data():
    data = fetch_real_time_data()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
