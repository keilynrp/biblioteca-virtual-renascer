
import requests
import os
import logging

logger = logging.getLogger(__name__)

class PayPalService:
    def __init__(self):
        self.client_id = os.getenv('PAYPAL_CLIENT_ID')
        self.secret = os.getenv('PAYPAL_SECRET')
        self.sandbox = os.getenv('PAYPAL_MODE', 'sandbox') == 'sandbox'
        self.base_url = "https://api-m.sandbox.paypal.com" if self.sandbox else "https://api-m.paypal.com"

    def get_access_token(self):
        url = f"{self.base_url}/v1/oauth2/token"
        headers = {
            "Accept": "application/json",
            "Accept-Language": "en_US",
        }
        data = {"grant_type": "client_credentials"}
        try:
            response = requests.post(url, auth=(self.client_id, self.secret), headers=headers, data=data)
            response.raise_for_status()
            return response.json().get('access_token')
        except Exception as e:
            logger.error(f"PayPal Access Token Error: {str(e)}")
            return None

    def capture_order(self, order_id):
        token = self.get_access_token()
        if not token:
            return None

        url = f"{self.base_url}/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        try:
            response = requests.post(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"PayPal Capture Order Error: {str(e)}")
            return None

    def verify_order(self, order_id):
        token = self.get_access_token()
        if not token:
            return None

        url = f"{self.base_url}/v2/checkout/orders/{order_id}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"PayPal Verify Order Error: {str(e)}")
            return None
