import random
from django.core.cache import cache
from rest_framework import views, status, permissions, generics
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AdminLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({"error": "Phone number is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(phone_number=phone_number, is_staff=True)
        except User.DoesNotExist:
            return Response({"error": "Admin account not found."}, status=status.HTTP_404_NOT_FOUND)

        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Admin login successful!",
            "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
            "user": {"name": user.name, "phone_number": user.phone_number, "role": user.role, "is_staff": user.is_staff}
        })


class RegisterSendOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        name = request.data.get('name')
        email = request.data.get('email', '')
        role = request.data.get('role')

        if not phone_number or not name or not role:
            return Response({"error": "Phone number, name, and role are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(phone_number=phone_number).exists():
            return Response({"error": "Account already exists. Please go to Login."}, status=status.HTTP_400_BAD_REQUEST)

        otp = str(random.randint(100000, 999999))
        cache.set(f"auth_{phone_number}", {'action': 'register', 'otp': otp, 'name': name, 'email': email, 'role': role}, timeout=300)

        print(f"\n{'='*50}", flush=True)
        print(f"[REGISTER OTP] Phone: {phone_number}", flush=True)
        print(f"[REGISTER OTP] Code:  {otp}", flush=True)
        print(f"{'='*50}\n", flush=True)
        import sys
        sys.stdout.flush()
        return Response({"message": "Registration OTP sent successfully.", "dev_otp": otp}, status=status.HTTP_200_OK)


class LoginSendOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')

        if not phone_number:
            return Response({"error": "Phone number is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not User.objects.filter(phone_number=phone_number).exists():
            return Response({"error": "Account not found. Please register first."}, status=status.HTTP_404_NOT_FOUND)

        otp = str(random.randint(100000, 999999))
        cache.set(f"auth_{phone_number}", {'action': 'login', 'otp': otp}, timeout=300)

        print(f"\n{'='*50}", flush=True)
        print(f"[LOGIN OTP] Phone: {phone_number}", flush=True)
        print(f"[LOGIN OTP] Code:  {otp}", flush=True)
        print(f"{'='*50}\n", flush=True)
        import sys
        sys.stdout.flush()
        return Response({"message": "Login OTP sent successfully.", "dev_otp": otp}, status=status.HTTP_200_OK)


class VerifyOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        provided_otp = request.data.get('otp')

        if not phone_number or not provided_otp:
            return Response({"error": "Phone number and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        cache_data = cache.get(f"auth_{phone_number}")

        if not cache_data or cache_data.get('otp') != provided_otp:
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        if cache_data.get('action') == 'register':
            user = User.objects.create_user(
                phone_number=phone_number,
                name=cache_data.get('name'),
                email=cache_data.get('email'),
                role=cache_data.get('role')
            )
        else:
            user = User.objects.get(phone_number=phone_number)

        # Activate user if inactive
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])

        refresh = RefreshToken.for_user(user)
        cache.delete(f"auth_{phone_number}")

        return Response({
            "message": "Authentication successful!",
            "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
            "user": {"name": user.name, "phone_number": user.phone_number, "role": user.role, "is_staff": user.is_staff}
        }, status=status.HTTP_200_OK)
