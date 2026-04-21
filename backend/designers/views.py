from rest_framework import generics, views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Avg
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
            }
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
    """POST: Upload a new design."""
    queryset = DesignContent.objects.all()
    serializer_class = DesignContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesigner]

    def perform_create(self, serializer):
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
    """GET: Public feed of all designs."""
    queryset = DesignContent.objects.all().order_by('-created_at')
    serializer_class = DesignContentSerializer
    permission_classes = [permissions.AllowAny]
