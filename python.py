import requests

# Replace 'YOUR_API_KEY' with your actual News API key
api_key = 'a79fb7c7169443e3b2fea3699ac48fa9'
url = 'https://newsapi.org/v2/top-headlines'

# Define parameters for the request
params = {
    'country': 'us',  # You can change this to any country code
    'category': 'general',  # You can specify categories like business, technology, etc.
    'pageSize': 5,  # Number of articles to retrieve
    'apiKey': api_key
}

# Make a request to the News API
response = requests.get(url, params=params)

# Check if the request was successful
if response.status_code == 200:
    data = response.json()
    articles = data.get('articles', [])
    
    # Print out the headlines and descriptions
    for article in articles:
        print(f"Title: {article['title']}")
        print(f"Description: {article['description']}\n")
else:
    print(f"Failed to fetch news: {response.status_code}")