from datetime import timedelta
import random
import string
from django.utils import timezone

# OTP validity duration in minutes
OTP_VALIDITY_MINUTES = 10


def generate_otp(length=6):
    """Generate a random numeric OTP code"""
    return ''.join(random.choices(string.digits, k=length))


def is_otp_valid(pending_otp):
    """Check if the OTP is still valid (within 10 minutes and not used)"""
    if pending_otp.is_used:
        return False
    expiry_time = pending_otp.created_at + timedelta(minutes=OTP_VALIDITY_MINUTES)
    return timezone.now() <= expiry_time
