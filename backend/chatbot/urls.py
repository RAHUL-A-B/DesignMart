from django.urls import path
from .views import AskChatbotView

urlpatterns = [
    path('chatbot/ask/', AskChatbotView.as_view(), name='ask-chatbot'),
]