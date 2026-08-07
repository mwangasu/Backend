from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import UserProfile

ROLE_RANK = UserProfile.ROLE_RANK


def user_role(user):
    if not user or not user.is_authenticated:
        return "guest"

    # Query fresh rather than trust `user.profile` - Django can cache the
    # auto-created default profile onto the in-memory user object (via the
    # post_save signal) before a same-request role change is written,
    # leaving a stale cached role behind.
    profile = UserProfile.objects.filter(user=user).only("role").first()
    return profile.role if profile else "guest"


def user_rank(user):
    return ROLE_RANK.get(user_role(user), 0)


def has_min_role(user, role):
    return user_rank(user) >= ROLE_RANK[role]


class MinRole(BasePermission):
    """Factory-style permission: require at least the given role rank.

    Usage: permission_classes = [MinRole("admin")]
    """

    def __init__(self, role="staff"):
        self.role = role
        self.message = f"This action requires {role} access or higher."

    def __call__(self):
        return self

    def has_permission(self, request, view):
        return has_min_role(request.user, self.role)


# Pre-built instances for the common tiers, so views can reference them
# directly without instantiating MinRole() themselves.
IsStaff = MinRole("staff")
IsAdmin = MinRole("admin")
IsOfficial = MinRole("official")

# Backwards-compatible alias used by earlier code.
IsSuperAdmin = IsAdmin


class ReadOnlyOrAdminWrite(BasePermission):
    """Anyone can read (the public submission form needs counties/wards/
    categories), but only admin-or-above can create, edit, or delete them."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return has_min_role(request.user, "admin")
