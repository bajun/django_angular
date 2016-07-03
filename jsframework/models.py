from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings
# create tokens for new users
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

# Create your models here.
class Post(models.Model):
	title = models.CharField(max_length = 75)
	content = models.TextField()
	author = models.ForeignKey('auth.User', related_name='posts')
	# author field
	def __str__(self):
		return self.title
	def save(self, *args, **kwargs):
		super(Post, self).save(*args, **kwargs)
