from rest_framework import generics, views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SavedDesign, Order, OrderItem, Review
from designers.models import DesignContent
from .serializers import OrderSerializer, ReviewSerializer
from designers.serializers import DesignContentSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class ToggleSaveDesignView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, design_id):
        design = get_object_or_404(DesignContent, id=design_id)
        saved_item, created = SavedDesign.objects.get_or_create(user=request.user, design=design)
        if not created:
            saved_item.delete()
            return Response({"message": "Removed from favorites"})
        return Response({"message": "Added to favorites"}, status=status.HTTP_201_CREATED)

class MySavedDesignsView(generics.ListAPIView):
    serializer_class = DesignContentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return [record.design for record in SavedDesign.objects.filter(user=self.request.user)]

class SyncUserDataView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        saved_design_ids = request.data.get('saved_designs', [])
        merged_count = 0
        if saved_design_ids:
            designs = DesignContent.objects.filter(id__in=saved_design_ids)
            for design in designs:
                obj, created = SavedDesign.objects.get_or_create(user=request.user, design=design)
                if created: merged_count += 1
        return Response({"message": "Data sync complete!", "items_merged": merged_count}, status=status.HTTP_200_OK)


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return Order.objects.filter(user=self.request.user).order_by('-created_at')

class CreateReviewView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer): serializer.save(user=self.request.user)

# Add/Update these inside shoppers/views.py
from .models import Cart, CartItem
from .serializers import CartSerializer

class ManageCartView(views.APIView):
    """GET: View Cart | POST: Add Item | DELETE: Remove Item (guests use session, logged-in use DB)"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return Response(CartSerializer(cart).data)
        # Guest: return session cart
        guest_cart = request.session.get('guest_cart', [])
        guest_cart = [i if isinstance(i, dict) else {'design_id': i, 'quantity': 1} for i in guest_cart]
        design_ids = [item['design_id'] for item in guest_cart]
        designs = DesignContent.objects.filter(id__in=design_ids)
        qty_map = {item['design_id']: item['quantity'] for item in guest_cart}
        return Response({
            "items": [{"design": DesignContentSerializer(d).data, "quantity": qty_map.get(str(d.id), 1)} for d in designs],
            "total_price": sum(d.price * qty_map.get(str(d.id), 1) for d in designs if d.price)
        })

    def post(self, request):
        design_id = request.data.get('design_id')
        if not design_id:
            return Response({"error": "design_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        get_object_or_404(DesignContent, id=design_id)

        if request.user.is_authenticated:
            design = get_object_or_404(DesignContent, id=design_id)
            quantity = int(request.data.get('quantity', 1))
            cart, _ = Cart.objects.get_or_create(user=request.user)
            item, item_created = CartItem.objects.get_or_create(cart=cart, design=design)
            if not item_created:
                return Response({"message": "Item is already in your cart"}, status=status.HTTP_200_OK)
            item.quantity = quantity
            item.save(update_fields=['quantity'])
            return Response({"message": "Added to cart successfully", "quantity": quantity}, status=status.HTTP_201_CREATED)

        # Guest: store in session
        guest_cart = request.session.get('guest_cart', [])
        # normalize old string format
        guest_cart = [i if isinstance(i, dict) else {'design_id': i, 'quantity': 1} for i in guest_cart]
        if any(item['design_id'] == design_id for item in guest_cart):
            return Response({"message": "Item is already in your cart"}, status=status.HTTP_200_OK)
        guest_cart.append({'design_id': design_id, 'quantity': int(request.data.get('quantity', 1))})
        request.session['guest_cart'] = guest_cart
        return Response({"message": "Added to cart successfully"}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        design_id = request.data.get('design_id')
        quantity = request.data.get('quantity')

        if not design_id or quantity is None:
            return Response({"error": "design_id and quantity are required"}, status=status.HTTP_400_BAD_REQUEST)

        quantity = int(quantity)
        if quantity < 1:
            return Response({"error": "quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            item = CartItem.objects.filter(cart=cart, design__id=design_id).first()
            if not item:
                return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)
            item.quantity = quantity
            item.save(update_fields=['quantity'])
            return Response({"message": "Quantity updated", "quantity": quantity})

        # Guest: update quantity in session
        guest_cart = request.session.get('guest_cart', [])
        guest_cart = [i if isinstance(i, dict) else {'design_id': i, 'quantity': 1} for i in guest_cart]
        for item in guest_cart:
            if isinstance(item, dict) and item['design_id'] == design_id:
                item['quantity'] = quantity
                request.session['guest_cart'] = guest_cart
                return Response({"message": "Quantity updated", "quantity": quantity})
        return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request):
        design_id = request.data.get('design_id')
        if not design_id:
            return Response({"error": "design_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_authenticated:
            cart = get_object_or_404(Cart, user=request.user)
            deleted, _ = CartItem.objects.filter(cart=cart, design__id=design_id).delete()
            if deleted:
                return Response({"message": "Removed from cart"})
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        # Guest: remove from session
        guest_cart = request.session.get('guest_cart', [])
        guest_cart = [i if isinstance(i, dict) else {'design_id': i, 'quantity': 1} for i in guest_cart]
        new_cart = [item for item in guest_cart if item['design_id'] != design_id]
        if len(new_cart) == len(guest_cart):
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)
        request.session['guest_cart'] = new_cart
        return Response({"message": "Removed from cart"})


# --- UPDATED CHECKOUT VIEW ---
class CheckoutView(views.APIView):
    """POST: Checks out using the database Cart, then empties the Cart."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        name = request.data.get('name')
        shipping_address = request.data.get('shipping_address')
        city = request.data.get('city')
        postal_code = request.data.get('postal_code')
        payment_type = request.data.get('payment_type', 'Cash on Delivery')

        if not name or not shipping_address or not city or not postal_code:
            return Response({"error": "All shipping details are required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Grab the cart directly from the backend database!
        cart = getattr(request.user, 'cart', None)
        if not cart or not cart.items.exists():
            return Response({"error": "Your cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Extract designs and calculate total
        total = sum([item.design.price * item.quantity for item in cart.items.all() if item.design.price])
        
        # 3. Create the Order
        order = Order.objects.create(
            user=request.user, 
            name=name,
            total_amount=total, 
            shipping_address=shipping_address, 
            city=city, 
            postal_code=postal_code,
            payment_type=payment_type
        )
        
        for item in cart.items.all(): 
            OrderItem.objects.create(order=order, design=item.design, price=item.design.price * item.quantity)
            
        # 4. MAGIC STEP: Empty the cart now that they have paid!
        cart.items.all().delete()
            
        return Response({"message": "Order placed successfully!", "order_id": order.id}, status=status.HTTP_201_CREATED)
    



# Add this inside shoppers/views.py

class TrackOrderView(views.APIView):
    """GET: Shopper tracks all items in a specific order."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)
        items = OrderItem.objects.filter(order=order)
        return Response({
            "order_id": order.id,
            "order_date": order.created_at,
            "shipping_address": f"{order.shipping_address}, {order.city}, {order.postal_code}",
            "items": [
                {
                    "design": item.design.title if item.design else "Deleted",
                    "price": item.price,
                    "status": item.status,
                    "tracking_number": item.tracking_number or "Not assigned yet"
                }
                for item in items
            ]
        })


class SyncCartView(views.APIView):
    """
    POST: Merges both the guest session cart AND any offline_cart IDs sent from frontend
    into the logged-in user's DB cart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items_added = 0

        session_cart = request.session.pop('guest_cart', [])
        offline_cart = request.data.get('offline_cart', [])

        # Normalize session cart (list of dicts with design_id/quantity)
        all_items = {}
        for item in session_cart:
            if isinstance(item, dict):
                all_items[item.get('design_id') or item.get('id')] = item.get('quantity', item.get('qty', 1))
            else:
                all_items[item] = 1

        # Normalize offline_cart (can be strings or {id, qty} dicts)
        for item in offline_cart:
            if isinstance(item, dict):
                did = item.get('id') or item.get('design_id')
                qty = item.get('qty', item.get('quantity', 1))
            else:
                did = item
                qty = 1
            if did and did not in all_items:
                all_items[did] = qty

        for design in DesignContent.objects.filter(id__in=all_items.keys()):
            cart_item, created = CartItem.objects.get_or_create(cart=cart, design=design)
            if created:
                cart_item.quantity = all_items[str(design.id)]
                cart_item.save()
                items_added += 1

        return Response({"message": "Cart synced successfully!", "items_added": items_added}, status=status.HTTP_200_OK)




from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import ContactMessage
from .serializers import ContactMessageSerializer

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny] # Anyone can send a message without logging in



from django.db.models import Q
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, user_id):
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    if request.method == 'GET':
        messages = ChatMessage.objects.filter(
            Q(sender=request.user, receiver=other_user) |
            Q(sender=other_user, receiver=request.user)
        ).order_by('timestamp')
        
        # Mark messages as read when fetched
        messages.filter(receiver=request.user, is_read=False).update(is_read=True)
        
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required'}, status=400)
            
        message = ChatMessage.objects.create(
            sender=request.user,
            receiver=other_user,
            content=content
        )
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_conversations(request):
    # Get all users the current user has chatted with
    messages = ChatMessage.objects.filter(Q(sender=request.user) | Q(receiver=request.user))
    user_ids = set()
    for msg in messages:
        if msg.sender != request.user:
            user_ids.add(msg.sender.id)
        if msg.receiver != request.user:
            user_ids.add(msg.receiver.id)
            
    users = User.objects.filter(id__in=user_ids)
    
    data = [{'id': u.id, 'name': getattr(u, 'name', getattr(u, 'username', 'Unknown')), 'role': getattr(u, 'role', 'USER')} for u in users]
    return Response(data)
