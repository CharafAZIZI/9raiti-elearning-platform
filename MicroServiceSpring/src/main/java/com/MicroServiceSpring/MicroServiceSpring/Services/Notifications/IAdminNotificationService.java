package com.MicroServiceSpring.MicroServiceSpring.Services.Notifications;

public interface IAdminNotificationService {

    void sendBroadcast(String message, String type, String cible);

}