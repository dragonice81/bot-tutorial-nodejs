export interface SpotifyPermissions {
  global: boolean;
  users: UserPermissions[];
}

interface UserPermissions {
  canSpotify: boolean;
  user_id: string;
  name: string;
  admin?: boolean;
}
