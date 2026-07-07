from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UserBlock",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("reason", models.CharField(blank=True, max_length=255)),
                ("blocked", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="blocks_received", to=settings.AUTH_USER_MODEL)),
                ("blocker", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="blocks_created", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="UserReport",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("category", models.CharField(choices=[("profile", "Profile"), ("message", "Message"), ("gift_note", "Gift Note"), ("venue", "Venue"), ("other", "Other")], default="other", max_length=32)),
                ("object_id", models.CharField(blank=True, max_length=255)),
                ("reason", models.CharField(max_length=255)),
                ("details", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("open", "Open"), ("reviewing", "Reviewing"), ("actioned", "Actioned"), ("dismissed", "Dismissed")], default="open", max_length=32)),
                ("admin_notes", models.TextField(blank=True)),
                ("reported_user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="reports_received", to=settings.AUTH_USER_MODEL)),
                ("reporter", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reports_created", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name="userblock",
            constraint=models.UniqueConstraint(fields=("blocker", "blocked"), name="unique_user_block"),
        ),
        migrations.AddConstraint(
            model_name="userblock",
            constraint=models.CheckConstraint(condition=models.Q(("blocker", models.F("blocked")), _negated=True), name="blocker_not_blocked_self"),
        ),
    ]
