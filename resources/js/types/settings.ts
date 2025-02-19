export interface Settings {
    site_name: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_username?: string;
    smtp_password?: string;
    pusher_app_id?: string;
    pusher_key?: string;
    pusher_secret?: string;
    pusher_cluster?: string;
    [key: string]: any; // Pour les autres paramètres dynamiques
  }
