from django.conf.urls import patterns, include, url
from rest_framework.routers import DefaultRouter
from jsframework import views


router = DefaultRouter()
router.register(r'posts', views.PostViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^api/', include(router.urls)),
    #url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api-auth/', include('rest_auth.urls')),
]