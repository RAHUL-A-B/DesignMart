import requests
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from designers.models import DesignContent

OLLAMA_API_URL = "http://localhost:11434/api/generate"
TEXT_MODEL = "tinyllama"
VISION_MODEL = "llava" # The model used for image analysis

class AskChatbotView(APIView):

    def post(self, request):
        user_message = request.data.get("message", "").lower()
        base64_image = request.data.get("image", None) # Expects a base64 string
        
        # User's comprehensive system prompt
        persona_rules = """You are an AI fashion shopping assistant for an online clothing marketplace.

Your job is to recommend ONLY relevant products based on the user's message.

STRICT RULES:
1. Read the user question carefully.
2. Detect: Gender (men, women, boys, girls, kids), Dress type, Color, Occasion.
3. Return ONLY matching products.
4. NEVER return unrelated products.
5. NEVER mix men, women, and kids categories.
6. If the user asks for men party wear: ONLY show men's party wear.
7. If the user asks for red dresses: ONLY show red dresses.
8. If no products match: reply "Sorry, no matching products found."

RESPONSE STYLE:
Clean, short, professional, shopping assistant style. Use bullet points for product names.

GOOD RESPONSE EXAMPLES:

User: "Please send men party wears"
Correct Answer:
* Black Premium Men's Blazer
* Slim Fit Party Shirt
* Luxury Evening Suit
* White Formal Party Jacket

User: "Show me red party dresses"
Correct Answer:
* Red Satin Evening Gown
* Red Velvet Cocktail Dress
* Red Designer Party Wear
* Red Luxury Maxi Dress

User: "Kids ivory chiffon party dress"
Correct Answer:
* Kids Ivory Chiffon Princess Dress
* Kids Elegant White Party Gown
* Kids Pearl Party Dress

FINAL INSTRUCTION:
Accuracy is more important than creativity. Never hallucinate unrelated products.
You MUST respond with a valid JSON object with two keys: "reply" (your formatted response) and "search_keyword" (the main color/category for database search).
"""

        # 1. Determine the model and construct the prompt
        if base64_image:
            model_to_use = VISION_MODEL
            prompt = f"""{persona_rules}

The user uploaded an image. The user says: "{user_message}"

You MUST respond with a valid JSON object ONLY, formatted like this:
{{
    "reply": "Your conversational response in the clean shopping format",
    "search_keyword": "the color or category extracted, or empty string if none"
}}
"""
            payload = {
                "model": model_to_use,
                "prompt": prompt,
                "images": [base64_image],
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.2,
                    "top_p": 0.8,
                    "repeat_penalty": 1.2,
                    "num_predict": 200
                }
            }
        else:
            model_to_use = TEXT_MODEL
            prompt = f"""{persona_rules}

Analyze the user's message and extract fashion categories or colors.
User Message: "{user_message}"

You MUST respond with a valid JSON object ONLY.
Example:
User Message: "show me some red party dresses"
Output:
{{
    "reply": "* Red Satin Evening Gown\n* Red Velvet Cocktail Dress\n* Red Designer Party Wear",
    "search_keyword": "red party"
}}

Now, generate the JSON for the User Message: "{user_message}"
"""
            payload = {
                "model": model_to_use,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.2,
                    "top_p": 0.8,
                    "repeat_penalty": 1.2,
                    "num_predict": 200
                }
            }

        try:
            # 2. Call Ollama API (added timeout so it doesn't hang forever)
            response = requests.post(OLLAMA_API_URL, json=payload, timeout=10)
            
            if response.status_code == 200:
                raw_response = response.json().get("response", "{}")
                try:
                    ai_data = json.loads(raw_response)
                    reply = ai_data.get("reply", "Here is what I found for you.")
                    search_keyword = ai_data.get("search_keyword", "").lower()
                except Exception:
                    reply = "I've searched our catalog for you!"
                    search_keyword = ""
                
                # Cleanup hallucinated replies from small models
                bad_phrases = ["friendly conversational", "possible json", "sure!", "here is a", "the user's message was"]
                for bad in bad_phrases:
                    if bad in reply.lower():
                        reply = "Hello! How can I help you find the perfect outfit today?"
                        break
            else:
                reply = f"My AI brain is offline right now, but I can still help you search!"
                search_keyword = ""
                
        except requests.exceptions.RequestException as e:
            print("Ollama Error:", e)
            reply = "I'm currently working in offline mode, but I can still help you search!"
            search_keyword = ""

        # Robust Fallback: Force strict category matching even if AI is vague
        known_categories = ["traditional", "party", "casual", "wedding", "saree", "kurti", "dress", "lehenga", "suit", "shirt", "pant", "men", "women", "kids", "black", "red", "blue", "white", "pink", "gown"]
        
        for cat in known_categories:
            if cat in user_message.lower():
                search_keyword = cat
                if "offline" in reply.lower() or "searched" in reply.lower():
                    reply = f"Here are some lovely {cat} options from our collection!"
                break

        # 3. Query the Database with Smart Filtering
        products = []
        search_query = (search_keyword + " " + user_message).lower()
        
        if search_keyword or any(word in user_message for word in ["men", "women", "kids", "party", "dress", "shirt", "suit"]):
            from django.db.models import Q
            
            designs = DesignContent.objects.all()
            
            # 1. GENDER/CATEGORY FILTERING (Strict)
            if any(word in search_query for word in ["men", "man", "boy", "gentleman"]):
                designs = designs.filter(category='MEN')
            elif any(word in search_query for word in ["women", "woman", "girl", "lady", "female", "frock", "gown", "saree"]):
                designs = designs.filter(category='WOMEN')
            elif any(word in search_query for word in ["kids", "child", "children", "baby", "princess"]):
                designs = designs.filter(category='CHILDREN')
            
            # 2. DESIGN TYPE FILTERING (Strict)
            if "party" in search_query:
                designs = designs.filter(design_type='PARTY')
            elif any(word in search_query for word in ["traditional", "wedding", "saree", "ethnic"]):
                designs = designs.filter(design_type='TRADITIONAL')
            elif any(word in search_query for word in ["formal", "suit", "blazer", "tuxedo"]):
                designs = designs.filter(design_type='FORMAL')
            elif "casual" in search_query:
                designs = designs.filter(design_type='CASUAL')
            
            # 3. KEYWORD FILTERING
            ignore_words = ["men", "women", "kids", "party", "wear", "send", "show", "me", "please", "some", "the", "a", "dress"]
            keywords = [kw for kw in search_query.replace(',', ' ').split() if kw not in ignore_words]
            
            if keywords:
                q_objects = Q()
                for kw in keywords:
                    q_objects |= Q(title__icontains=kw) | Q(description__icontains=kw)
                designs = designs.filter(q_objects)
            
            designs = designs.distinct()[:5]

            products = [
                {
                    "id": design.id,
                    "title": design.title,
                    "image": design.image.url if design.image else None,
                    "price": str(design.price) if design.price else "0.00",
                }
                for design in designs
            ]

        # 4. Return response
        return Response({
            "reply": reply,
            "products": products
        }, status=status.HTTP_200_OK)
