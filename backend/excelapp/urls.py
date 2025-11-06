
from django.urls import path
from .views import ExcelSummaryView

urlpatterns = [
    path('api/upload/', ExcelSummaryView.as_view(), name='upload')
]
