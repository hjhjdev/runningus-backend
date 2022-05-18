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

export interface UserAuthModel {
  UID?: string;
  USER_UID?: string;
  REFRESH_TOKEN: string;
}

export type findOauthIdReturn = Pick<UserModel, 'UID'>;

export type UserRefreshTokenFindReturn = Required<Pick<UserAuthModel, 'REFRESH_TOKEN' | 'USER_UID'>>;
