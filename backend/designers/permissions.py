from rest_framework import permissions

class IsDesigner(permissions.BasePermission):
    """Allows access only to authenticated users with the DESIGNER role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'DESIGNER')