from rest_framework.throttling import AnonRateThrottle

class OTPThrottle(AnonRateThrottle):
    rate = '5/min'
