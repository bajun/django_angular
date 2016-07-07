from rest_framework import serializers
from jsframework.models import Post
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
            

class PostSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(many=False, queryset=User.objects.all(),allow_null = False)
    author_name = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Post
        fields = ('id','title','content','author','author_name')

class UserSerializer(serializers.ModelSerializer):
    posts = PostSerializer(many=True, read_only=True,allow_null=True)
    class Meta:
        model = User
        fields = ('id', 'username','email', 'first_name', 'last_name', 'posts')


class UserDetailsSerializerExtended(serializers.ModelSerializer):
    posts = serializers.PrimaryKeyRelatedField(many=True, queryset=Post.objects.all(),allow_null = True)
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name','posts','is_staff')
        read_only_fields = ('email', 'is_staff')