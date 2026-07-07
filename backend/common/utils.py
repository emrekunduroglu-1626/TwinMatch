from django.http import JsonResponse


def placeholder_response(name: str):
    return JsonResponse({"detail": f"{name} endpoint skeleton hazır."})