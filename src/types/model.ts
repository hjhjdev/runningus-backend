export interface UserModel {
  UID?: string;
  OAUTH_ID?: string;
  NICK?: string;
  SEX?: string;
  BORN?: Date;
  DISTANCE?: number;
  POINT_ADDRESS?: Record<string, string>;
  TEXT_ADDRESS?: Record<string, string>;
  PHONE?: string;
  MANNER_POINT?: string;
  POWER?: string;
  POINT?: number;
}

export type findOauthIdReturn = Pick<UserModel, 'UID'>;
