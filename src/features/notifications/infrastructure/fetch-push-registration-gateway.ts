import type { DeviceRegistration } from '@/features/notifications/domain/models';
import type { PushRegistrationGateway } from '@/features/notifications/domain/ports';
import { getNotificationsRegistrationUrl } from '@/features/notifications/config';

export class FetchPushRegistrationGateway implements PushRegistrationGateway {
  async upsertDeviceRegistration(registration: DeviceRegistration) {
    const endpoint = getNotificationsRegistrationUrl();
    if (!endpoint) {
      throw new Error('Missing notifications registration endpoint configuration.');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_uuid: registration.deviceUuid,
        push_token: registration.pushToken,
        platform: registration.platform,
      }),
    });

    if (!response.ok) {
      throw new Error(`Push registration failed with HTTP ${response.status}`);
    }
  }
}
