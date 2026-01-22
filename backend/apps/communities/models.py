from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

class ReadingClub(models.Model):
    name = models.CharField(_("Nombre del Club"), max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(_("Descripción"))
    cover_image = models.ImageField(upload_to='clubs/covers/', blank=True, null=True)
    is_private = models.BooleanField(_("Es Privado"), default=False)
    
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='created_clubs'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='ClubMembership',
        related_name='joined_clubs'
    )

    class Meta:
        verbose_name = _("Club de Lectura")
        verbose_name_plural = _("Clubes de Lectura")
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ClubMembership(models.Model):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrador'),
        ('MODERATOR', 'Moderador'),
        ('MEMBER', 'Miembro'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    club = models.ForeignKey(ReadingClub, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    # For private clubs request
    is_approved = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'club')
        verbose_name = _("Membresía")
        verbose_name_plural = _("Membresías")

    def __str__(self):
        return f"{self.user.username} - {self.club.name} ({self.role})"

class DiscussionThread(models.Model):
    club = models.ForeignKey(ReadingClub, on_delete=models.CASCADE, related_name='threads')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(_("Título"), max_length=200)
    # Optional relation to a book if the discussion is about a specific book
    book = models.ForeignKey('content.Book', on_delete=models.SET_NULL, null=True, blank=True, related_name='discussions')
    
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Denormalized count for performance
    posts_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_pinned', '-updated_at']
        verbose_name = _("Hilo de Discusión")
        verbose_name_plural = _("Hilos de Discusión")

    def __str__(self):
        return self.title

class Post(models.Model):
    thread = models.ForeignKey(DiscussionThread, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(_("Contenido"))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = _("Publicación")
        verbose_name_plural = _("Publicaciones")

    def __str__(self):
        return f"Post by {self.author.username} in {self.thread.title}"
