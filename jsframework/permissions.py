from rest_framework import permissions


class IsOwnerOrReadOnlyOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        return (obj.author == request.user) or request.user.is_staff
