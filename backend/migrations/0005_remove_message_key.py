# Generated by Django 4.1.5 on 2023-03-24 15:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_alter_message_key'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='message',
            name='key',
        ),
    ]
