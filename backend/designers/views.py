from rest_framework import generics, views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Avg
import base64
import requests
from rest_framework.exceptions import ValidationError

from .models import DesignContent
from .serializers import DesignContentSerializer
from .permissions import IsDesigner
from shoppers.models import OrderItem, Review
from shoppers.serializers import OrderItemSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class DesignerDashboardAPIView(views.APIView):
    """GET: Real dashboard stats for the logged-in designer."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]

    def get(self, request):
        user = request.user
        my_designs = DesignContent.objects.filter(designer=user)
        my_order_items = OrderItem.objects.filter(design__designer=user)

        total_designs = my_designs.count()
        pending_orders = my_order_items.filter(status='Pending').count()
        total_earnings = my_order_items.filter(status='Delivered').aggregate(
            total=Sum('price'))['total'] or 0.00
        average_rating = Review.objects.filter(design__designer=user).aggregate(
            avg=Avg('rating'))['avg'] or 0.0

        # --- NEW CODE TO FETCH ADMIN MESSAGES ---
        from shoppers.models import ChatMessage
        
        recent_messages = ChatMessage.objects.filter(receiver=user).order_by('-timestamp')[:3]
        admin_messages = [
            {
                "id": msg.id,
                "content": msg.content,
                "timestamp": msg.timestamp.strftime("%Y-%m-%d %H:%M"),
                "is_read": msg.is_read
            }
            for msg in recent_messages
        ]
        # ----------------------------------------

        return Response({
            "designer_profile": {
                "name": user.name,
                "phone_number": user.phone_number,
                "email": user.email
            },
            "overview_stats": {
                "total_designs": total_designs,
                "pending_orders": pending_orders,
                "total_earnings": total_earnings,
                "average_rating": round(average_rating, 1)
            },
            # Add this line to the response!
            "admin_messages": admin_messages 
        })


class DesignerProfileUpdateView(views.APIView):
    """PATCH: Update designer's own profile (name, email)."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]

    def patch(self, request):
        user = request.user
        name = request.data.get('name')
        email = request.data.get('email')

        if name:
            if not name.strip():
                return Response({"error": "Name cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
            user.name = name.strip()
        if email is not None:
            user.email = email

        user.save(update_fields=['name', 'email'])
        return Response({
            "message": "Profile updated successfully.",
            "name": user.name,
            "email": user.email
        })


class ContentUploadView(generics.CreateAPIView):
    """POST: Upload a new design with AI Auto-Moderation."""
    queryset = DesignContent.objects.all()
    serializer_class = DesignContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesigner]

    def perform_create(self, serializer):
        image_file = self.request.FILES.get('image')
        
        if image_file:
            # 1. Read the image and convert it to base64 for the AI
            image_data = image_file.read()
            base64_image = base64.b64encode(image_data).decode('utf-8')
            
            # Reset the file pointer so Django can save it correctly if approved
            image_file.seek(0)
            
            # 2. Ask Ollama (Llava Vision Model) to verify the image
            OLLAMA_API_URL = "http://localhost:11434/api/generate"
            prompt = "Analyze this image. Is this a piece of clothing, apparel, or a fashion item? You must answer exactly with one word: YES or NO."
            
            payload = {
                "model": "llava",
                "prompt": prompt,
                "images": [base64_image],
                "stream": False
            }
            
            try:
                # We use a timeout so the upload doesn't hang forever if Ollama is slow
                response = requests.post(OLLAMA_API_URL, json=payload, timeout=20)
                if response.status_code == 200:
                    ai_answer = response.json().get("response", "").strip().upper()
                    
                    # 3. If the AI explicitly says NO, block the upload!
                    if "NO" in ai_answer and "YES" not in ai_answer:
                        raise ValidationError({"image": "Upload Blocked: Our AI detected that this image is not a valid fashion product or dress."})
                        
            except requests.exceptions.RequestException:
                # If Ollama is offline, we skip moderation and let them upload.
                print("Warning: AI Moderation offline. Allowing upload.")

        # If it passes AI moderation (or if AI is offline), save the product to the database
        serializer.save(designer=self.request.user)



class DesignerDesignListView(generics.ListAPIView):
    """GET: List all designs by the logged-in designer."""
    serializer_class = DesignContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesigner]

    def get_queryset(self):
        return DesignContent.objects.filter(designer=self.request.user).order_by('-created_at')


class DesignContentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET, PATCH, DELETE: Manage a specific design (own only)."""
    serializer_class = DesignContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesigner]

    def get_queryset(self):
        return DesignContent.objects.filter(designer=self.request.user)


class DesignerOrderItemsView(generics.ListAPIView):
    """GET: List only the OrderItems that belong to this designer's designs."""
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesigner]

    def get_queryset(self):
        return OrderItem.objects.filter(
            design__designer=self.request.user
        ).order_by('-order__created_at')


class DesignerOrderItemUpdateView(views.APIView):
    """PATCH: Update status and tracking number of a specific OrderItem (own only)."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]

    def patch(self, request, pk):
        item = get_object_or_404(OrderItem, pk=pk, design__designer=request.user)

        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number')

        valid_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered']
        if new_status and new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Choose from: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_status:
            item.status = new_status
        if tracking_number:
            item.tracking_number = tracking_number

        item.save(update_fields=['status', 'tracking_number'])
        return Response({
            "message": "Order item updated.",
            "status": item.status,
            "tracking_number": item.tracking_number
        })


class ContentFeedView(generics.ListAPIView):
    """GET: Public feed of all designs with optional category filter."""
    serializer_class = DesignContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = DesignContent.objects.all().order_by('-created_at')
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category.upper())
        return qs
