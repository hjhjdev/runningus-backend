export interface MeetModel {
  UID?: string;
  NAME?: string;
  HOST?: number;
  STATE?: number;
  POINT?: Record<string, string>;
  MAX_NUM?: number;
  REG_DATE?: Date;
  EX_DISTANCE?: number;
  EX_START_TIME?: Date;
  EX_END_TIME?: Date;
  DISTANCE?: number;
  START_TIME?: Date;
  END_TIME?: Date;
  LEVEL?: number;
}

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

export type FindRoombyRoomUidReturn = Required<Pick<MeetModel, 'STATE' | 'MAX_NUM'>>'