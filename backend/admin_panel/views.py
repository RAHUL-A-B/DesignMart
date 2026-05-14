from rest_framework import views, generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Count, Avg
from django.contrib.auth import get_user_model

from .permissions import IsAdmin
from .models import DesignerPayout
from .serializers import (
    AdminUserSerializer, AdminOrderSerializer, AdminOrderItemSerializer,
    AdminDesignSerializer, AdminReviewSerializer, DesignerPayoutSerializer
)
from shoppers.models import Order, OrderItem, Review
from designers.models import DesignContent

User = get_user_model()
COMMISSION_RATE = 0.10  # 10% platform cut


# ─── ANALYTICS ────────────────────────────────────────────────────────────────

class AdminAnalyticsView(views.APIView):
    """GET: Platform-wide analytics."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        total_revenue = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = Order.objects.count()
        total_users = User.objects.filter(role='USER').count()
        total_designers = User.objects.filter(role='DESIGNER').count()
        total_designs = DesignContent.objects.count()

        top_designers = (
            User.objects.filter(role='DESIGNER')
            .annotate(avg_rating=Avg('designs__review__rating'), total_designs=Count('designs'))
            .order_by('-avg_rating')[:5]
            .values('id', 'name', 'phone_number', 'avg_rating', 'total_designs')
        )

        orders_by_city = (
            Order.objects.values('city')
            .annotate(total=Count('id'))
            .order_by('-total')[:5]
        )

        return Response({
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "total_users": total_users,
            "total_designers": total_designers,
            "total_designs": total_designs,
            "top_designers": list(top_designers),
            "top_cities": list(orders_by_city),
        })


# ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """GET: List all users."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        qs = User.objects.all().order_by('-date_joined')
        if role:
            qs = qs.filter(role=role.upper())
        return qs


class AdminUserDetailView(views.APIView):
    """GET: View user | PATCH: Update role/ban | DELETE: Delete user."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        return Response(AdminUserSerializer(user).data)

    def patch(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        # Allow updating: is_active (ban/unban), role (promote/demote)
        allowed_fields = ['is_active', 'role']
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return Response({"message": "User updated.", "user": AdminUserSerializer(user).data})

    def delete(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return Response({"message": "User deleted."}, status=status.HTTP_204_NO_CONTENT)


class AdminApproveDesignerView(views.APIView):
    """PATCH: Approve a designer account (activate it)."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, user_id):
        designer = get_object_or_404(User, id=user_id, role='DESIGNER')
        designer.is_active = True
        designer.save(update_fields=['is_active'])
        return Response({"message": f"{designer.name} has been approved."})


class AdminBanUserView(views.APIView):
    """PATCH: Ban or unban a user."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        state = "unbanned" if user.is_active else "banned"
        return Response({"message": f"{user.name} has been {state}."})


# ─── ORDER MANAGEMENT ─────────────────────────────────────────────────────────

class AdminOrderListView(generics.ListAPIView):
    """GET: View all orders across the platform."""
    serializer_class = AdminOrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = Order.objects.all().order_by('-created_at')


class AdminOrderItemUpdateView(views.APIView):
    """PATCH: Force update status/tracking on any order item (dispute resolution)."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, item_id):
        item = get_object_or_404(OrderItem, id=item_id)
        valid_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Refunded']

        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number')

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
        return Response({"message": "Order item updated.", "status": item.status})


# ─── CONTENT MODERATION ───────────────────────────────────────────────────────

class AdminDesignListView(generics.ListAPIView):
    """GET: View all designs on the platform."""
    serializer_class = AdminDesignSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = DesignContent.objects.all().order_by('-created_at')


class AdminDesignDeleteView(views.APIView):
    """DELETE: Remove any design (stolen/inappropriate content)."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def delete(self, request, design_id):
        design = get_object_or_404(DesignContent, id=design_id)
        design.delete()
        return Response({"message": "Design deleted."}, status=status.HTTP_204_NO_CONTENT)


class AdminReviewListView(generics.ListAPIView):
    """GET: View all reviews on the platform."""
    serializer_class = AdminReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = Review.objects.all().order_by('-id')


class AdminReviewDeleteView(views.APIView):
    """DELETE: Remove any abusive or fake review."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def delete(self, request, review_id):
        review = get_object_or_404(Review, id=review_id)
        review.delete()
        return Response({"message": "Review deleted."}, status=status.HTTP_204_NO_CONTENT)


# ─── FINANCIAL / PAYOUTS ──────────────────────────────────────────────────────

class AdminDesignerEarningsView(views.APIView):
    """GET: Calculate earnings for a specific designer after commission."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request, designer_id):
        designer = get_object_or_404(User, id=designer_id, role='DESIGNER')

        total_earnings = OrderItem.objects.filter(
            design__designer=designer,
            status='Delivered'
        ).aggregate(total=Sum('price'))['total'] or 0

        commission = round(float(total_earnings) * COMMISSION_RATE, 2)
        payout_amount = round(float(total_earnings) - commission, 2)

        return Response({
            "designer": designer.name,
            "total_earnings": total_earnings,
            "commission_rate": f"{int(COMMISSION_RATE * 100)}%",
            "commission_deducted": commission,
            "payout_amount": payout_amount,
        })


class AdminCreatePayoutView(views.APIView):
    """POST: Create a payout record for a designer."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, designer_id):
        designer = get_object_or_404(User, id=designer_id, role='DESIGNER')

        total_earnings = OrderItem.objects.filter(
            design__designer=designer,
            status='Delivered'
        ).aggregate(total=Sum('price'))['total'] or 0

        commission = round(float(total_earnings) * COMMISSION_RATE, 2)
        payout_amount = round(float(total_earnings) - commission, 2)

        payout = DesignerPayout.objects.create(
            designer=designer,
            total_earnings=total_earnings,
            commission=commission,
            payout_amount=payout_amount,
        )
        return Response(DesignerPayoutSerializer(payout).data, status=status.HTTP_201_CREATED)


class AdminMarkPayoutPaidView(views.APIView):
    """PATCH: Mark a payout as paid."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, payout_id):
        payout = get_object_or_404(DesignerPayout, id=payout_id)
        payout.status = 'Paid'
        payout.paid_at = timezone.now()
        payout.save(update_fields=['status', 'paid_at'])
        return Response({"message": "Payout marked as paid.", "paid_at": payout.paid_at})


class AdminPayoutListView(generics.ListAPIView):
    """GET: List all payouts."""
    serializer_class = DesignerPayoutSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = DesignerPayout.objects.all().order_by('-created_at')


from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from shoppers.models import ContactMessage
from shoppers.serializers import ContactMessageSerializer

class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser] # Only admins can see the messages


from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from shoppers.models import ContactMessage
from shoppers.serializers import ContactMessageSerializer

class ContactMessageRespondView(generics.UpdateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        # 1. Save the admin response and mark as resolved
        instance = serializer.save(
            is_resolved=True, 
            responded_at=timezone.now()
        )
        
        # 2. Send the email to the user
        subject = f"Response to your inquiry: {instance.subject}"
        email_body = (
            f"Hi {instance.name},\n\n"
            f"Thank you for contacting DesignMart. Our team has reviewed your message:\n\n"
            f"Your Message: \"{instance.message}\"\n\n"
            f"--- OUR RESPONSE ---\n"
            f"{instance.admin_response}\n\n"
            f"If you have further questions, feel free to reach out again.\n\n"
            f"Best regards,\n"
            f"DesignMart Administration"
        )
        
        send_mail(
            subject,
            email_body,
            settings.DEFAULT_FROM_EMAIL,  # Make sure this is set in settings.py
            [instance.email],
            fail_silently=False,
        )


from rest_framework import generics
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Banner
from .serializers import BannerSerializer

# 1. Public View (Shoppers) - GET only
class ActiveBannerListView(generics.ListAPIView):
    queryset = Banner.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]

# 2. Admin View: List and Create (GET all, POST)
class AdminBannerListCreateView(generics.ListCreateAPIView):
    queryset = Banner.objects.all().order_by('-created_at')
    serializer_class = BannerSerializer
    authentication_classes = [JWTAuthentication] # Bypasses CSRF issues
    permission_classes = [IsAdminUser]

# 3. Admin View: Retrieve, Update, Delete (GET one, PUT, PATCH, DELETE)
class AdminBannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    authentication_classes = [JWTAuthentication] # Bypasses CSRF issues
    permission_classes = [IsAdminUser]



from django.core.mail import send_mail
from django.conf import settings
from designers.models import DesignContent
from shoppers.models import ChatMessage # Import the Chat model

class AdminRejectDesignView(views.APIView):
    """POST: Send a chat message & email to the designer, then delete the design."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, design_id):
        design = get_object_or_404(DesignContent, id=design_id)
        reason = request.data.get('reason', 'Violation of terms and conditions.')
        
        # 1. Create an internal Chat Message from the Admin to the Designer
        ChatMessage.objects.create(
            sender=request.user, # The Admin who clicked reject
            receiver=design.designer,
            content=f"⚠️ System Notice: Your design '{design.title}' has been removed by the administration.\n\nReason: {reason}\n\nPlease ensure all future uploads comply with our guidelines."
        )
        
        # 2. Send Email to Designer (Optional fallback)
        subject = f"Design Rejected: {design.title}"
        email_body = (
            f"Hi {design.designer.name},\n\n"
            f"Unfortunately, your uploaded design '{design.title}' has been removed by the administration.\n\n"
            f"Reason for removal:\n"
            f"{reason}\n\n"
            f"Best regards,\nDesignMart Administration"
        )
        
        send_mail(
            subject,
            email_body,
            settings.DEFAULT_FROM_EMAIL,
            [design.designer.email],
            fail_silently=True,
        )
        
        # 3. Delete the design after notifying
        design.delete()
        return Response({"message": "Designer notified and design deleted."}, status=status.HTTP_200_OK)
