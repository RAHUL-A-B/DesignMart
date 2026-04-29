from django.urls import path
from .views import RegisterSendOTPView, LoginSendOTPView, VerifyOTPView, AdminLoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/send-otp/', RegisterSendOTPView.as_view(), name='register-send-otp'),
    path('auth/login/send-otp/', LoginSendOTPView.as_view(), name='login-send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]