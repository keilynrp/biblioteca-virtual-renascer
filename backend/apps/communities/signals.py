from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post, DiscussionThread
from apps.notifications.models import Notification

@receiver(post_save, sender=DiscussionThread)
def notify_new_thread(sender, instance, created, **kwargs):
    if created:
        club = instance.club
        members = club.members.exclude(id=instance.author.id)
        
        for member in members:
            Notification.objects.create(
                user=member,
                type=Notification.NotificationType.COMMUNITY_ACTIVITY,
                title=f"Nuevo hilo en {club.name}",
                message=f"{instance.author.username} ha iniciado una discusión: {instance.title}",
                link=f"/clubs/{club.slug}",
                metadata={
                    'club_id': club.id,
                    'thread_id': instance.id,
                    'author': instance.author.username
                }
            )

@receiver(post_save, sender=Post)
def notify_new_reply(sender, instance, created, **kwargs):
    if created:
        thread = instance.thread
        club = thread.club
        
        # If it's the first post of a thread, notify_new_thread already handles it or we should avoid double notification
        # But usually 'createThread' in communities/views.py creates the thread and then potentially a post.
        # Let's check if there are other posts in the thread.
        if thread.posts.count() > 1:
            # Notify thread author and other participants
            participants = thread.posts.values_list('author', flat=True).distinct()
            members_to_notify = thread.club.members.filter(id__in=participants).exclude(id=instance.author.id)
            
            for member in members_to_notify:
                Notification.objects.create(
                    user=member,
                    type=Notification.NotificationType.COMMUNITY_ACTIVITY,
                    title=f"Nueva respuesta en {thread.title}",
                    message=f"{instance.author.username} ha respondido a la discusión.",
                    link=f"/clubs/{club.slug}",
                    metadata={
                        'club_id': club.id,
                        'thread_id': thread.id,
                        'post_id': instance.id,
                        'author': instance.author.username
                    }
                )
