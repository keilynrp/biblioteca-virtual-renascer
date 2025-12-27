
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.subscriptions.models import Plan
from apps.content.models import Category, Author, Book
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Populate database with seed data'

    def handle(self, *args, **kwargs):
        fake = Faker()
        self.stdout.write('Seeding data...')

        # 1. Plans
        plans_data = [
            {'name': 'Basic Plan', 'price': 0.00, 'duration': 30, 'features': ['Access to Free Books', 'Ad-supported']},
            {'name': 'Standard Plan', 'price': 9.99, 'duration': 30, 'features': ['Access to Library', 'No Ads', 'HD Reading']},
            {'name': 'Premium Plan', 'price': 99.99, 'duration': 365, 'features': ['All Features', 'Offline Mode', 'Priority Support', 'Exclusive Content']}
        ]
        
        for p in plans_data:
            Plan.objects.get_or_create(
                name=p['name'],
                defaults={
                    'description': f"The best {p['name']} for you.",
                    'price': p['price'],
                    'duration_days': p['duration'],
                    'features': p['features'],
                    'is_active': True
                }
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(plans_data)} Plans'))

        # 2. Categories
        categories = ['Technology', 'Science Fiction', 'History', 'Business', 'Romance', 'Fantasy', 'Self-Help']
        db_categories = []
        for cat_name in categories:
            cat, _ = Category.objects.get_or_create(
                name=cat_name,
                defaults={'description': fake.text()}
            )
            db_categories.append(cat)
        self.stdout.write(self.style.SUCCESS(f'Created {len(categories)} Categories'))

        # 3. Authors
        db_authors = []
        for _ in range(10):
            author, _ = Author.objects.get_or_create(
                name=fake.name(),
                defaults={'bio': fake.paragraph()}
            )
            db_authors.append(author)
        self.stdout.write(self.style.SUCCESS('Created 10 Authors'))

        # 4. Books
        if Book.objects.count() < 20:
            for _ in range(20):
                Book.objects.create(
                    title=fake.catch_phrase(),
                    description=fake.paragraph(nb_sentences=5),
                    author=random.choice(db_authors),
                    category=random.choice(db_categories),
                    publication_date=fake.date_between(start_date='-10y', end_date='today'),
                    isbn=fake.isbn13(),
                    is_premium=random.choice([True, False]),
                    # Using a placeholder file/image usually requires actual files.
                    # For now, we leave them blank or handle in frontend placeholders.
                    file='books/files/placeholder.pdf' 
                )
            self.stdout.write(self.style.SUCCESS('Created 20 Books'))
        else:
            self.stdout.write('Books already exist, skipping creation.')

        self.stdout.write(self.style.SUCCESS('Data population complete!'))
