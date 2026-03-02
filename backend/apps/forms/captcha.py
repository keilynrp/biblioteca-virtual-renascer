"""
Captcha verification backends for the forms module.

Each verify_* function returns (is_valid: bool, reason: str).
"""
import logging
import time
import requests

logger = logging.getLogger(__name__)


def verify_turnstile(token: str, secret_key: str, ip: str = '') -> tuple[bool, str]:
    """Verify a Cloudflare Turnstile token server-side."""
    if not token:
        return False, 'Token de Turnstile no proporcionado.'
    if not secret_key:
        logger.error('Turnstile secret key not configured')
        return False, 'Configuración de captcha incompleta.'

    try:
        resp = requests.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data={
                'secret': secret_key,
                'response': token,
                'remoteip': ip,
            },
            timeout=10,
        )
        data = resp.json()
        if data.get('success'):
            return True, ''
        error_codes = data.get('error-codes', [])
        logger.warning('Turnstile verification failed: %s', error_codes)
        return False, 'Verificación de captcha fallida.'
    except Exception as e:
        logger.exception('Turnstile verification error: %s', e)
        # Fail open on network errors to not block legitimate users
        return True, ''


def verify_recaptcha_v3(
    token: str, secret_key: str, score_threshold: float = 0.5, ip: str = '',
) -> tuple[bool, str]:
    """Verify a Google reCAPTCHA v3 token server-side."""
    if not token:
        return False, 'Token de reCAPTCHA no proporcionado.'
    if not secret_key:
        logger.error('reCAPTCHA secret key not configured')
        return False, 'Configuración de captcha incompleta.'

    try:
        resp = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': secret_key,
                'response': token,
                'remoteip': ip,
            },
            timeout=10,
        )
        data = resp.json()
        if not data.get('success'):
            error_codes = data.get('error-codes', [])
            logger.warning('reCAPTCHA v3 verification failed: %s', error_codes)
            return False, 'Verificación de captcha fallida.'

        score = data.get('score', 0.0)
        if score < score_threshold:
            logger.info('reCAPTCHA v3 low score: %.2f (threshold: %.2f)', score, score_threshold)
            return False, 'Actividad sospechosa detectada.'

        return True, ''
    except Exception as e:
        logger.exception('reCAPTCHA v3 verification error: %s', e)
        return True, ''


def verify_numeric_captcha(
    answer: str, expected_answer: str,
) -> tuple[bool, str]:
    """Verify a numeric CAPTCHA answer."""
    if not answer:
        return False, 'Respuesta del captcha no proporcionada.'

    try:
        if str(int(answer)) == str(int(expected_answer)):
            return True, ''
    except (ValueError, TypeError):
        pass

    return False, 'Respuesta del captcha incorrecta.'


def verify_time_based(
    form_loaded_at: float, min_seconds: int = 3,
) -> tuple[bool, str]:
    """Verify that enough time passed between form load and submission."""
    if not form_loaded_at:
        return False, 'Información de tiempo no proporcionada.'

    try:
        elapsed = time.time() - float(form_loaded_at)
        if elapsed < min_seconds:
            return False, f'Envío demasiado rápido ({elapsed:.1f}s). Espera al menos {min_seconds}s.'
        return True, ''
    except (ValueError, TypeError):
        return False, 'Información de tiempo inválida.'


def verify_captcha(form, captcha_data: dict, ip: str = '') -> tuple[bool, str]:
    """
    Route captcha verification to the appropriate backend based on form config.

    captcha_data may contain:
        - captcha_token: Turnstile or reCAPTCHA token
        - captcha_answer: Numeric CAPTCHA answer
        - captcha_expected: Expected numeric answer (hashed or plain)
        - form_loaded_at: Unix timestamp of when the form was loaded
    """
    provider = form.captcha_provider

    if provider == 'none':
        return True, ''

    if provider == 'turnstile':
        return verify_turnstile(
            token=captcha_data.get('captcha_token', ''),
            secret_key=form.captcha_secret_key,
            ip=ip,
        )

    if provider == 'recaptcha_v3':
        return verify_recaptcha_v3(
            token=captcha_data.get('captcha_token', ''),
            secret_key=form.captcha_secret_key,
            score_threshold=form.captcha_score_threshold,
            ip=ip,
        )

    if provider == 'numeric':
        return verify_numeric_captcha(
            answer=captcha_data.get('captcha_answer', ''),
            expected_answer=captcha_data.get('captcha_expected', ''),
        )

    if provider == 'time_based':
        return verify_time_based(
            form_loaded_at=captcha_data.get('form_loaded_at', 0),
            min_seconds=form.captcha_min_seconds,
        )

    logger.warning('Unknown captcha provider: %s', provider)
    return True, ''
