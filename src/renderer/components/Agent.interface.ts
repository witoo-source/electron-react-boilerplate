export interface IAgent {
  uuid: string;
  displayName: string;
  description: string;
  developerName: string;
  releaseDate: string; 
  characterTags: string[];
  displayIcon: string;
  displayIconSmall: string;
  bustPortrait: string;
  fullPortrait: string;
  fullPortraitV2: string;
  killfeedPortrait: string;
  background: string;
  backgroundGradientColors: string[];
  assetPath: string;
  isFullPortraitRightFacing: boolean;
  isPlayableCharacter: boolean;
  isAvailableForTest: boolean;
  isBaseContent: boolean;
  role: Role;
  recruitmentData: RecruitmentData;
  abilities: Ability[];
  voiceLine: VoiceLine;
}

export interface Role {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
  assetPath: string;
}

export interface RecruitmentData {
  counterId: string;
  milestoneId: string;
  milestoneThreshold: number;
  useLevelVpCostOverride: boolean;
  levelVpCostOverride: number;
  startDate: string; 
  endDate: string;   
}

export interface Ability {
  slot: string;
  displayName: string;
  description: string;
  displayIcon: string;
}

export interface VoiceLine {
  minDuration: number;
  maxDuration: number;
  mediaList: Media[];
}

export interface Media {
  id: number;
  wwise: string;
  wave: string;
}

export interface IUser {
    country: string;
    sub: string;
    email_verified: boolean;
    player_plocale?: unknown | null;
    country_at: number | null;
    pw: {
        cng_at: number;
        reset: boolean;
        must_reset: boolean;
    };
    phone_number_verified: boolean;
    account_verified: boolean;
    ppid?: unknown | null;
    federated_identity_providers: string[];
    player_locale: string | null;
    acct: {
        type: number;
        state: string;
        adm: boolean;
        game_name: string;
        tag_line: string;
        created_at: number;
    };
    age: number;
    jti: string;
    affinity: {
        [x: string]: string;
    };
};

export interface IPreGame {
    Subject: string;
    MatchID: string;
    Version: number;
}