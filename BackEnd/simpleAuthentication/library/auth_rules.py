def active_user_only(user):
    return user is not None and user.is_active
