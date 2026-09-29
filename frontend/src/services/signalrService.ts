import * as signalR from '@microsoft/signalr';
import { Notification } from '../types';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private notificationCallbacks: ((notification: Notification) => void)[] = [];
  private urgentAlertCallbacks: ((alert: Notification) => void)[] = [];
  private isStarting = false;

  private getHubUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}/hubs/notifications`;
  }

  public async startConnection(): Promise<void> {
    const token = localStorage.getItem('flowtask_access_token');
    if (!token) return;

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.isStarting) return;
    this.isStarting = true;

    try {
      if (this.connection) {
        try {
          await this.connection.stop();
        } catch {
          // ignore
        }
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.getHubUrl(), {
          accessTokenFactory: () => {
            return localStorage.getItem('flowtask_access_token') || '';
          },
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.on('ReceiveNotification', (notification: Notification) => {
        this.notificationCallbacks.forEach((cb) => {
          try {
            cb(notification);
          } catch (err) {
            console.error('Error in notification callback', err);
          }
        });
      });

      this.connection.on('ReceiveUrgentAlert', (alert: Notification) => {
        this.urgentAlertCallbacks.forEach((cb) => {
          try {
            cb(alert);
          } catch (err) {
            console.error('Error in urgent alert callback', err);
          }
        });
      });

      await this.connection.start();
    } catch (err) {
      console.warn('SignalR Connection could not be established immediately, will retry:', err);
    } finally {
      this.isStarting = false;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // ignore
      }
      this.connection = null;
    }
  }

  public onNotification(callback: (notification: Notification) => void): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onUrgentAlert(callback: (alert: Notification) => void): () => void {
    this.urgentAlertCallbacks.push(callback);
    return () => {
      this.urgentAlertCallbacks = this.urgentAlertCallbacks.filter((cb) => cb !== callback);
    };
  }
}

export const signalRService = new SignalRService();
