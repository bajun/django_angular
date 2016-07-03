from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.views import APIView

from jsframework.models import Post
from jsframework.permissions import IsOwnerOrReadOnlyOrAdmin
from jsframework.serializers import PostSerializer,UserSerializer,UserDetailsSerializerExtended



#
class PostViewSet(viewsets.ModelViewSet):
	"""
	This viewset automatically provides `list`, `create`, `retrieve`,
	`update` and `destroy` actions.
	"""
	queryset = Post.objects.all()
	serializer_class = PostSerializer
	permission_classes = (IsOwnerOrReadOnlyOrAdmin,permissions.IsAuthenticated)

	def perform_create(self, serializer_class):
		serializer_class.save(author=self.request.user)

	def get_queryset(self):
		user = self.request.user

		if(user.is_staff):
			result = Post.objects.all()
		else :
			result = Post.objects.filter(author = user)

		return result
#
class UserViewSet(viewsets.ModelViewSet):
	"""
	This viewset automatically provides `list`, 'create' and `detail` actions.
	"""
	permission_classes = (permissions.IsAdminUser,)
	queryset = User.objects.all()
	serializer_class = UserSerializer
	def perform_create(self,serializer_class):
		serializer_class.save(password = make_password(self.request.data['username']))

#


# Create your views here.
def index(request):
	return render(request, 'jsframework/index.html')