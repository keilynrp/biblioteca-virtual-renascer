import logging
from django.db import transaction as db_transaction
from django.utils import timezone

logger = logging.getLogger(__name__)


def _generate_invoice_number():
    """Generate a sequential invoice number like INV-2026-000042 using select_for_update."""
    from apps.billing.models import Invoice

    year = timezone.now().year
    # Lock the table row for the latest invoice of this year to avoid race conditions
    last = (
        Invoice.objects.select_for_update()
        .filter(invoice_number__startswith=f'INV-{year}-')
        .order_by('-invoice_number')
        .first()
    )
    if last:
        try:
            seq = int(last.invoice_number.split('-')[-1]) + 1
        except (ValueError, IndexError):
            seq = 1
    else:
        seq = 1
    return f'INV-{year}-{seq:06d}'


@db_transaction.atomic
def create_invoice_for_transaction(transaction_obj):
    """
    Create an Invoice for the given Transaction.
    Idempotent: if the invoice already exists (via OneToOne) it returns the existing one.
    """
    from apps.billing.models import Invoice, BillingProfile

    # Idempotency: return existing invoice if already created
    try:
        return transaction_obj.invoice
    except Invoice.DoesNotExist:
        pass

    # Get or build billing snapshot
    billing_name = ''
    billing_address = ''
    try:
        profile = BillingProfile.objects.get(user=transaction_obj.user)
        billing_name = profile.full_name or transaction_obj.user.username
        billing_address = profile.get_address_snapshot()
    except BillingProfile.DoesNotExist:
        billing_name = transaction_obj.user.username

    invoice_number = _generate_invoice_number()

    description = ''
    if transaction_obj.plan:
        description = f'Subscription: {transaction_obj.plan.name}'

    invoice = Invoice.objects.create(
        user=transaction_obj.user,
        transaction=transaction_obj,
        invoice_number=invoice_number,
        status=Invoice.STATUS_PAID,
        amount=transaction_obj.amount,
        currency=transaction_obj.currency,
        description=description,
        billing_name=billing_name,
        billing_address=billing_address,
    )
    logger.info(f'Invoice {invoice_number} created for transaction {transaction_obj.id}')
    return invoice
