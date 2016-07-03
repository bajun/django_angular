from rest_framework import serializers
from jsframework.models import Post
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
			

class PostSerializer(serializers.ModelSerializer):
	author = serializers.ReadOnlyField(source='author.username')
	author_id = serializers.ReadOnlyField(source='author.id')
	class Meta:
		model = Post
		fields = ('id','title','content','author','author_id')

class UserSerializer(serializers.ModelSerializer):
    posts = PostSerializer(many=True, read_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'posts')


class UserDetailsSerializerExtended(serializers.ModelSerializer):
    posts = serializers.PrimaryKeyRelatedField(many=True, queryset=Post.objects.all(),allow_null = True)
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name','posts','is_staff')
        read_only_fields = ('email', )